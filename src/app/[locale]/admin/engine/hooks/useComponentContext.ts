import { useMemo } from "react";
import { IComponentNode, IResourceDefinition } from "../interfaces";
import { useStoresContext } from "@/app/[locale]/[...slug]/components/StoreContext";
import { interpolateParams } from "../renderer/trigger/interpolateParams";

type UseComponentContextOptions = {
  node: IComponentNode;
  provides?: Record<string, any>; // hérité du parent
};

export function useComponentContext({ node, provides = {} }: UseComponentContextOptions) {
  const fieldKey = useMemo(() => node.props?.name as string | undefined, [node.props?.name]);
  const stores = useStoresContext((state) => state.stores);
  const storeKey = useMemo(() => node.data?.store?.key || '', [node.data?.store?.key]);
  const storeData = useMemo(() => stores[storeKey]?.data || null, [stores, storeKey]);
  const resourceDefinition = useMemo(() => stores[storeKey]?.definition || null, [stores, storeKey]);

  const mergedProps = useMemo(() => {
    const resource = provides?.resourceDefinition as IResourceDefinition | undefined;
    const fieldDefinition = fieldKey ? resource?.fields?.[fieldKey] : undefined;
    return {
      ...(fieldDefinition?.props || {}),
      ...(node.props || {})
    };
  }, [fieldKey, node.props, provides?.resourceDefinition]);

  return {
    props: interpolateParams(mergedProps, provides, stores),
    fieldKey,
    storeData,
    resourceDefinition,
    params: interpolateParams(node.params || {}, provides, stores), // paramètres passés au composant
    // stores,
  };
}
