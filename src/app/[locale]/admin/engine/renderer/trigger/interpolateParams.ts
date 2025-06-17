import { IComponentNode } from "../../interfaces";

export function interpolateParams(
  paramsToInterporlate: any,
  provides: Record<string, any>,
  stores: Record<string, { data: any }> = {}
): any {
  const systemValues = {
    "now": new Date().toISOString(),
  }
  const providesWithSystemValues: Record<string, any> = {
    ...provides,
    ...systemValues
  };
  const resolveValue = (key: string): any => {
    // On remplace les éventuels index dynamiques type [youthListIndex]
    const resolvedKey = key.replace(/\[(.*?)\]/g, (_, match) => {
      const resolved = providesWithSystemValues?.[match.trim()];
      return typeof resolved !== "undefined" ? resolved : match;
    });

    // split path
    const parts = resolvedKey.split('.');
    const root = parts[0];

    // essayer dans provides
    if (providesWithSystemValues && root in providesWithSystemValues) {
      return parts.reduce((acc, part) => acc?.[part], providesWithSystemValues);
    }

    // essayer dans stores
    if (stores && root in stores) {
      const data = stores[root]?.data;
      return parts.slice(1).reduce((acc, part) => acc?.[part], data);
    }

    return "";
  };

  if (typeof paramsToInterporlate === "string") {
    const match = paramsToInterporlate.match(/^\{\{(.*?)\}\}$/);
    if (match) return resolveValue(match[1].trim());

    return paramsToInterporlate.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      return resolveValue(key.trim());
    });
  }

  if (Array.isArray(paramsToInterporlate)) {
    return paramsToInterporlate.map((item) =>
      interpolateParams(item, providesWithSystemValues, stores)
    );
  }

  if (typeof paramsToInterporlate === "object" && paramsToInterporlate !== null) {
    return Object.fromEntries(
      Object.entries(paramsToInterporlate).map(([k, v]) => [
        k,
        interpolateParams(v, providesWithSystemValues, stores),
      ])
    );
  }

  return paramsToInterporlate;
}

export function getValueAtPath(data: Record<string, any>, path: string): any {
  if (!path) return undefined;

  // Remplace les indices dynamiques comme [youthListIndex] avec leur valeur depuis `data`
  const resolvedPath = path.replace(/\[(.*?)\]/g, (_, key) => {
    const val = data?.[key];
    return val !== undefined ? String(val) : key;
  });

  return resolvedPath.split('.').reduce((acc, part) => acc?.[part], data);
}

export function resolveBindings(
  bindings: Record<string, string>,
  provides: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, path] of Object.entries(bindings)) {
    const value = getValueAtPath(provides, path);
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export function buildBindings(
  node: IComponentNode,
  contextBindings: Record<string, string> = {}
): Record<string, any> {
  return {
    ...contextBindings,
    ...(node.bindings || {}),
    ...(node.data?.query?.bindings || {})
  };
}