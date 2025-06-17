'use client';

import { Form } from '@/components/ui/form';
import { IComponentRegistryProps } from '../../interfaces';
import { ComponentRenderer } from './ComponentRenderer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useMemo } from 'react';
import { getZodSchemaFromResource } from '../zod-utils/utils';
import { cn } from '@/lib/utils';
import { useComponentContext } from '../../hooks/useComponentContext';
import useExecuteTrigger from '../../hooks/useExecuteTrigger';

export function FormRenderer({
  node,
  provides = {},
  bindings = {}
}: IComponentRegistryProps) {
  const { props, resourceDefinition } = useComponentContext({
    node,
    provides
  });
  const { execute } = useExecuteTrigger({ node });

  const schema = useMemo(
    () =>
      resourceDefinition
        ? getZodSchemaFromResource(resourceDefinition)
        : z.object({}),
    [resourceDefinition]
  );

  const formData = useMemo(() => props.formData || {}, [props.formData]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: formData
  });

  const onSubmit = useCallback(
    async (values: any) => {
      if (!resourceDefinition) {
        console.error(`Resource not found: ${node.data?.store?.resourceId}`);
        return;
      }
      const mergedProvides = {
        ...provides,
        values
      };
      await execute('onSubmit', mergedProvides);
    },
    [resourceDefinition, provides, execute, node.data?.store?.resourceId]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-4', node.props?.className)}>
        {node.children?.map((child) => (
          <ComponentRenderer
            key={child.key}
            node={child}
            contextProvides={provides}
            contextBindings={bindings} // Pass the index for list items
          />
        ))}
      </form>
    </Form>
  );
}
