'use client';

import { Input } from '@/components/ui/input';
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
import { ChangeEvent } from 'react';
import WrongConfig from '../WrongConfig';

export function InputRenderer({
  node,
  provides = {}
}: IComponentRegistryProps) {
  const { props, fieldKey, params } = useComponentContext({ node, provides });
  const { control, setValue } = useFormContext();
  const { execute } = useExecuteTrigger({ node });

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!fieldKey) return;
    setValue(fieldKey, event.target.value);
    if (node.events?.onChange) {
      execute('onChange', { ...provides, [fieldKey]: event.target.value });
    }
  };

  if (!fieldKey)
    return <WrongConfig message='❌ Input missing fieldKey' type={node.type} />;

  return (
    <FormField
      control={control}
      name={fieldKey}
      render={({ field }) => (
        <FormItem>
          {params.label ? <FormLabel>{params.label}</FormLabel> : null}
          <FormControl>
            <Input
              {...field}
              value={field.value || ''}
              onChange={handleValueChange}
              className={node.props?.className}
              placeholder={props.placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
