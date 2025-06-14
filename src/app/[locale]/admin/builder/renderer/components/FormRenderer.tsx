import { Form } from '@/components/ui/form';
import { IComponentRegistryProps } from '../../interfaces';
import { ComponentRenderer } from './ComponentRenderer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useResourceDefinition } from '../../hooks/useRessourceDefinition';
import { useCallback, useMemo } from 'react';
import { getZodSchemaFromResource } from '../zod-utils/utils';
import { cn } from '@/lib/utils';
import { executeTrigger } from '../trigger/executeTrigger';

export function FormRenderer({
  events = {},
  node,
  provides = {}
}: IComponentRegistryProps) {
  const resource = useResourceDefinition(node.data?.resourceId); // fetch from base or mock

  const schema = useMemo(
    () => (resource ? getZodSchemaFromResource(resource) : z.object({})),
    [resource]
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {}
  });

  const extendedProvides = useMemo(
    () => ({
      ...provides,
      form,
      // values: form.watch(), // pour affichage live ou triggers
      resourceDefinition: resource
    }),
    [provides, form, resource]
  );

  const onSubmit = useCallback(
    async (values: any) => {
      console.log('[Form] submitted values:', values);

      if (!resource) {
        console.error(`Resource not found: ${node.data?.resourceId}`);
        return;
      }
      const trigger = events?.onSubmit;

      if (trigger) {
        const context = {
          ...provides,
          // form,
          values
        };
        if (Array.isArray(trigger)) {
          for (const t of trigger) await executeTrigger(t, context);
        } else {
          await executeTrigger(trigger, context);
        }
        // ici tu pourras exécuter une action callApi, etc.
        console.log('[Trigger]', trigger, values);
      }
    },
    [events?.onSubmit, provides, resource, node.data?.resourceId]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-4', node.props?.className)}>
        {Object.keys(form.formState.errors).length ? (
          <div className='text-red-500'>
            ! {JSON.stringify(form.formState.errors, undefined, 2)}
          </div>
        ) : null}
        {node.children?.map((child) => (
          <ComponentRenderer
            key={child.key}
            node={child}
            provides={extendedProvides}
          />
        ))}
      </form>
    </Form>
  );
}
