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
  const { props, fieldName, params } = useComponentContext({ node, provides });
  const { control, setValue } = useFormContext();
  const { execute } = useExecuteTrigger({ node });

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!fieldName) return;
    setValue(fieldName, event.target.value);
    if (node.events?.onChange) {
      execute('onChange', { ...provides, [fieldName]: event.target.value });
    }
  };

  if (!fieldName)
    return (
      <WrongConfig message='❌ Input missing fieldName' type={node.type} />
    );

  return (
    <FormField
      control={control}
      name={fieldName}
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
