'use client';

import { Input } from '@/components/ui/input';
import { IComponentRegistryProps } from '../../interfaces';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { useComponentContext } from '../../hooks/useComponentContext';

export function InputRenderer({
  node,
  provides = {}
}: IComponentRegistryProps) {
  const { props, fieldKey } = useComponentContext({ node, provides });
  const { control } = useFormContext();
  const name = fieldKey;

  if (!name) return <div>❌ Input missing name</div>;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              {...field}
              value={field.value || ''}
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
