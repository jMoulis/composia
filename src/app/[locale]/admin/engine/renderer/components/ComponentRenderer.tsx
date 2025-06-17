'use client';

import React from 'react';
import { IComponentNode } from '../../interfaces';
import { componentRuntimeMap } from './componentRuntimeMap';
import { buildBindings, resolveBindings } from '../trigger/interpolateParams';
import { useStoresContext } from '@/app/[locale]/[...slug]/components/StoreContext';

interface ComponentRendererProps {
  node: IComponentNode;
  contextBindings?: Record<string, any>; // bindings hérités du parent
  contextProvides?: Record<string, any>; // hérité du parent, par exemple pour les ressources
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  node,
  contextBindings = {},
  contextProvides = {}
}) => {
  const Comp = componentRuntimeMap[node.type];
  const stores = useStoresContext((state) => state.stores);
  if (!Comp) {
    console.error(`Component runtime not found for type: ${node.type}`);
    return <div>Error: Component runtime not found</div>;
  }

  const bindings = buildBindings(node, contextBindings);

  const provides = {
    ...contextProvides,
    ...(node.provides || {}),
    stores
  };
  const resolvedProvides = {
    ...provides,
    ...resolveBindings(bindings, provides)
  };

  return (
    <Comp
      key={node.key}
      node={node}
      bindings={bindings}
      events={node.events || {}}
      provides={resolvedProvides || {}}
    />
  );
};
