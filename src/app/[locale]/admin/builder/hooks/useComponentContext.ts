import { useMemo } from "react";
import { IComponentNode, IResourceDefinition } from "../interfaces";

type UseComponentContextOptions = {
  node: IComponentNode;
  provides?: Record<string, any>; // hérité du parent
};

export function useComponentContext({ node, provides }: UseComponentContextOptions) {
  const fieldKey = node.data?.fieldKey;
  const resource = provides?.resourceDefinition as IResourceDefinition | undefined;

  // Résolution du champ (si applicable)
  const fieldDefinition = fieldKey ? resource?.fields?.[fieldKey] : undefined;

  // Fusion des props (priority: node.props > field.props)
  const mergedProps = useMemo(() => {
    return {
      ...(fieldDefinition?.props || {}),
      ...(node.props || {})
    };
  }, [fieldDefinition, node.props]);

  return {
    props: mergedProps,
    fieldKey,
    fieldDefinition,
    resource,
    provides,
    bindings: node.bindings || {},
    data: node.data,
    events: node.events || {}
  };
}
