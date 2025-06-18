'use client';

import { IComponentRegistryProps } from '../../../interfaces';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useComponentContext } from '../../../hooks/useComponentContext';
import useExecuteTrigger from '../../../hooks/useExecuteTrigger';
import { Switch } from '@/components/ui/switch';
import WrongConfig from '../WrongConfig';

export function SwitchRenderer({
  node,
  provides = {}
}: IComponentRegistryProps) {
  const { props, fieldName, params } = useComponentContext({ node, provides });
  const { control, setValue } = useFormContext();
  const { execute } = useExecuteTrigger({ node });

  const handleValueChange = (checked: boolean) => {
    if (!fieldName) return;
    setValue(fieldName, checked);
    if (node.events?.onChange) {
      execute('onChange', { ...provides, [fieldName]: checked });
    }
  };

  if (!fieldName)
    return (
      <WrongConfig message='❌ Switch missing fieldName' type={node.type} />
    );

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          {params.label ? <FormLabel>{params.label}</FormLabel> : null}
          <FormControl>
            <Switch
              {...field}
              checked={field.value || false}
              onCheckedChange={handleValueChange}
              className={props?.className}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
