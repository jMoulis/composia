import { getDocument } from "@/lib/mongodb/actions";
import { IComponentData, IComponentNode, IResourceDefinition, IStore, IStoreDefinition } from "../admin/engine/interfaces";
import { buildBindings, getValueAtPath, interpolateParams, resolveBindings } from "../admin/engine/renderer/trigger/interpolateParams";
import { SYSTEM_COLLECTIONS } from "@/lib/mongodb/system-collections";
import { executeDatabaseAction } from "../admin/engine/renderer/trigger/actions/executeDatabaseAction";


export async function resolveDataSource(
  node: IComponentNode,
  context: Record<string, any> = {}
): Promise<any> {
  if (!node.data?.source || !node.data.shouldResolvedSSR) return undefined;

  const data = node.data as IComponentData;
  switch (data.source) {
    case 'store': {
      const key = data.store?.key;
      if (!key) return undefined;
      const value = getValueAtPath(context, key);
      return value;
    }

    case 'query': {
      const query = data.query;
      if (!query) return undefined;

      const interpolatedQuery = interpolateParams(query, context, {});
      const response = await executeDatabaseAction(interpolatedQuery);
      return response.data;
    }

    case 'static': {
      return data.static;
    }

    case 'api': {
      const { url, method = 'GET', body, headers } = data.api || {};
      if (!url) return undefined;
      const resolvedUrl = interpolateParams(url, context);
      const resolvedBody = body ? interpolateParams(body, context) : undefined;
      const resolvedHeaders = headers
        ? interpolateParams(headers, context)
        : undefined;

      const response = await fetch(resolvedUrl, {
        method,
        headers: resolvedHeaders,
        body: body ? JSON.stringify(resolvedBody) : undefined
      });

      if (!response.ok) {
        console.warn(
          `[resolveDataSource] API error ${response.status}: ${url}`
        );
        return undefined;
      }

      return await response.json();
    }

    case 'computed': {
      try {
        const expression = data.computed ?? '';
        // Naïf — à sécuriser si besoin
        const func = new Function(
          'context',
          `with (context) { return ${expression}; }`
        );
        return func(context);
      } catch (e) {
        console.error(
          '[resolveDataSource] Error evaluating computed expression:',
          e
        );
        return undefined;
      }
    }

    case 'session': {
      const key = data.store?.key;
      return key ? getValueAtPath(context.session, key) : undefined;
    }

    case 'params': {
      const key = data.store?.key;
      return key ? getValueAtPath(context.routeParams, key) : undefined;
    }

    case 'form': {
      return undefined;
    }
    default:
      console.warn(
        `[resolveDataSource] Unknown source: ${data.source} ${node.type}`
      );
      return undefined;
  }
}

const fetchRessourceDefinition = async (
  resourceKey: string
): Promise<IResourceDefinition | null> => {
  try {
    const response = await getDocument<IResourceDefinition>(
      SYSTEM_COLLECTIONS.RESOURCES,
      {
        resourceKey
      }
    );
    return response;
  } catch (error: any) {
    console.error(
      `Error fetching resource definition for key ${resourceKey}:`,
      error
    );
    return null;
  }
};

export const resolveStores = async (
  stores: IStore[],
  provides: Record<string, any> = {}
): Promise<Record<string, IStoreDefinition>> => {
  const loadStore = async (store: IStore) => {
    const resolvedQuery = interpolateParams(store.query, provides);
    const definition = await fetchRessourceDefinition(store.query.collection);
    const { data } = await executeDatabaseAction(resolvedQuery);
    return {
      ...store,
      data,
      definition
    };
  };

  const storesResponse = await Promise.all(stores.map(loadStore));

  return storesResponse.reduce(
    (
      acc: Record<
        string,
        {
          data: any;
          storeKey: string;
          definition: IResourceDefinition | null;
        }
      >,
      store
    ) => {
      if (store.data) {
        acc[store.storeKey] = {
          storeKey: store.storeKey,
          data: store.data,
          definition: store.definition
        };
      }
      return acc;
    },
    {}
  );
};

export const resolvedNode = async (
  node: IComponentNode,
  contextBindings: Record<string, any> = {},
  contextProvides: Record<string, any> = {}
): Promise<IComponentNode> => {
  const bindings = buildBindings(node, contextBindings);

  const provides = {
    ...contextProvides,
    ...(node.provides || {})
  };
  const mergedProvides = {
    ...provides,
    ...resolveBindings(bindings, provides)
  };
  const children = await Promise.all(
    (node.children || []).map((child) =>
      resolvedNode(child, bindings, provides)
    )
  );

  const response = await resolveDataSource(node, mergedProvides);

  return {
    ...node,
    children,
    data: {
      ...node.data,
      resolvedData: response?.data || node.data?.resolvedData
    }
  };
};