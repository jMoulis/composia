'use client';

import { Form } from '@/components/ui/form';
import { IComponentRegistryProps } from '../../../interfaces';
import { ComponentRenderer } from '../ComponentRenderer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo } from 'react';
import { getZodSchemaFromResource } from '../../zod-utils/utils';
import { cn } from '@/lib/utils';
import { useComponentContext } from '../../../hooks/useComponentContext';
import useExecuteTrigger from '../../../hooks/useExecuteTrigger';

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
        : undefined,
    [resourceDefinition]
  );

  const formData = useMemo(() => props.formData || {}, [props.formData]);

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: formData
  });

  const onSubmit = useCallback(
    async (values: any) => {
      if (!resourceDefinition) {
        console.warn(`Resource not found: ${node.type}-${node.key}`);
      }
      const mergedProvides = {
        ...provides,
        values
      };
      if (node.events?.onSubmit) {
        await execute('onSubmit', mergedProvides);
      }
    },
    [
      resourceDefinition,
      provides,
      node.events?.onSubmit,
      node.type,
      node.key,
      execute
    ]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-2', node.props?.className)}>
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
