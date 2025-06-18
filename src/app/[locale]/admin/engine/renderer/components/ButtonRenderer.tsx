'use client';

import { Button } from '@/components/ui/button';
import { IComponentRegistryProps } from '../../interfaces';
import { ComponentRenderer } from './ComponentRenderer';
import { useComponentContext } from '../../hooks/useComponentContext';
import useExecuteTrigger from '../../hooks/useExecuteTrigger';
import { useFormContext } from 'react-hook-form';

export function ButtonRenderer({
  node,
  provides = {},
  bindings = {}
}: IComponentRegistryProps) {
  const { props, params } = useComponentContext({ node, provides });
  const { execute, loading } = useExecuteTrigger({ node });
  const formContext = useFormContext();

  return (
    <Button
      {...props}
      disabled={loading || formContext?.formState.isSubmitting}
      onClick={() => execute('onClick', provides)}>
      {node.children?.length
        ? node.children?.map((child) => (
            <ComponentRenderer
              key={child.key}
              node={child}
              contextBindings={bindings}
              contextProvides={provides}
            />
          ))
        : params.label}
    </Button>
  );
}
