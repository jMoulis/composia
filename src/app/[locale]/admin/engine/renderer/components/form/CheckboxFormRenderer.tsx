'use client';

import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useComponentContext } from '../../../hooks/useComponentContext';
import { IComponentRegistryProps } from '../../../interfaces';
import useExecuteTrigger from '../../../hooks/useExecuteTrigger';
import { ComponentRenderer } from '../ComponentRenderer';
import { cn } from '@/lib/utils';
import { CheckedState } from '@radix-ui/react-checkbox';
import WrongConfig from '../WrongConfig';

export function CheckboxFormRenderer({
  node,
  provides = {},
  bindings = {}
}: IComponentRegistryProps) {
  const { control, setValue } = useFormContext();
  const { fieldKey, params, props } = useComponentContext({ node, provides });
  const { execute } = useExecuteTrigger({ node });

  const handleValueChange = (value: CheckedState) => {
    if (!fieldKey) return;
    setValue(fieldKey, value);
    if (node.events?.onChange) {
      execute('onChange', { ...provides, [fieldKey]: value });
    }
  };

  if (!fieldKey) {
    return (
      <WrongConfig message='❌ Checkbox missing fieldKey' type={node.type} />
    );
  }

  return (
    <FormField
      control={control}
      name={fieldKey}
      render={({ field }) => {
        return (
          <FormItem
            className={cn('flex flex-row items-center gap-2', props.className)}>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={handleValueChange}
              />
            </FormControl>
            {node.children?.length ? (
              node.children?.map((child) => (
                <ComponentRenderer
                  key={child.key}
                  node={child}
                  contextBindings={bindings}
                  contextProvides={provides}
                />
              ))
            ) : params.label ? (
              <FormLabel>{params.label}</FormLabel>
            ) : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
