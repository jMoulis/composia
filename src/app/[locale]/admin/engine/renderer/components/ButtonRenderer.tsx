'use client';

import { Button } from '@/components/ui/button';
import { IComponentRegistryProps } from '../../interfaces';
import { ComponentRenderer } from './ComponentRenderer';
import { useComponentContext } from '../../hooks/useComponentContext';
import useExecuteTrigger from '../../hooks/useExecuteTrigger';

export function ButtonRenderer({
  node,
  provides = {},
  bindings = {}
}: IComponentRegistryProps) {
  const { props, params } = useComponentContext({ node, provides });
  const { execute, loading } = useExecuteTrigger({ node });
  const { label } = params;
  return (
    <Button
      {...props}
      disabled={loading}
      onClick={() =>
        execute('onClick', {
          ...provides,
          values: {
            _id: '234',
            firstname: 'John',
            lastname: 'Doe'
          }
        })
      }>
      {node.children?.length
        ? node.children.map((child) => (
            <ComponentRenderer
              key={child.key}
              node={child}
              contextBindings={bindings}
              contextProvides={provides}
            />
          ))
        : label}
    </Button>
  );
}
