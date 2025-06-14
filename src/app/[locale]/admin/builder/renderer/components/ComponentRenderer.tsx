'use client';

import React from 'react';
import { IComponentNode } from '../../interfaces';
import { componentRuntimeMap } from '../componentRuntimeMap';

interface ComponentRendererProps {
  node: IComponentNode;
  contextBindings?: Record<string, any>; // bindings hérités du parent
  provides?: Record<string, any>; // hérité du parent, par exemple pour les ressources
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  node,
  contextBindings = {}
}) => {
  const Comp = componentRuntimeMap[node.type];

  if (!Comp) {
    console.error(`Component runtime not found for type: ${node.type}`);
    return <div>Error: Component runtime not found</div>;
  }
  // Fusionner bindings hérités + bindings du node
  const resolvedBindings = {
    ...contextBindings,
    ...(node.bindings || {})
  };

  return (
    <Comp
      key={node.key}
      node={node}
      bindings={resolvedBindings}
      events={node.events || {}}
      provides={node.provides || {}}
    />
  );
};
