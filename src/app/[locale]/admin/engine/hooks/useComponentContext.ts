import { useMemo } from "react";
import { IComponentNode, IResourceDefinition } from "../interfaces";
import { useStoresContext } from "@/app/[locale]/[...slug]/stores/StoreContext";
import { interpolateParams } from "../renderer/trigger/interpolateParams";

type UseComponentContextOptions = {
  node: IComponentNode;
  provides?: Record<string, any>; // hérité du parent
};

export function useComponentContext({ node, provides = {} }: UseComponentContextOptions) {
  const fieldName = useMemo(() => node.props?.name as string | undefined, [node.props?.name]);
  const fieldKey = useMemo(() => node.data?.store?.fieldKey || node.data?.form?.fieldKey as string | undefined, [node.data?.form?.fieldKey, node.data?.store?.fieldKey]);
  const stores = useStoresContext((state) => state.stores);
  const storeKey = useMemo(() => node.data?.store?.key || '', [node.data?.store?.key]);
  const storeData = useMemo(() => stores[storeKey]?.data || null, [stores, storeKey]);
  const resourceDefinition = useMemo(() => stores[storeKey]?.definition || null, [stores, storeKey]);

  const data = useMemo(() => storeData || node.data?.staticData || node.data?.resolvedData || null, [storeData, node.data?.staticData, node.data?.resolvedData]);

  const mergedProps = useMemo(() => {
    const resource = provides?.resourceDefinition as IResourceDefinition | undefined;
    const fieldDefinition = fieldName ? resource?.fields?.[fieldName] : undefined;
    return {
      ...(fieldDefinition?.props || {}),
      ...(node.props || {})
    };
  }, [fieldName, node.props, provides?.resourceDefinition]);

  return {
    props: interpolateParams(mergedProps, provides, stores),
    fieldName,
    resourceDefinition,
    fieldKey,
    data,
    name: node.props?.name,
    params: interpolateParams(node.params || {}, provides, stores), // paramètres passés au
  };
}
