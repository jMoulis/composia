'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { IComponentRegistryProps } from '../../../interfaces';
import { useComponentContext } from '../../../hooks/useComponentContext';
import useExecuteTrigger from '../../../hooks/useExecuteTrigger';
import WrongConfig from '../WrongConfig';

export function SelectFormRenderer({
  node,
  provides = {}
}: IComponentRegistryProps) {
  const { props, params, data, fieldKey } = useComponentContext({
    node,
    provides
  });
  const { label } = params;
  const { placeholder, className = '' } = props;
  const { execute, loading } = useExecuteTrigger({ node });

  const form = useFormContext();

  if (!form) {
    return (
      <WrongConfig
        type={node.type}
        message={`Le composant ${node.type} doit être utilisé dans un formulaire`}
      />
    );
  }
  const handleValueChange = (value: string) => {
    if (!fieldKey) return;
    form.setValue(fieldKey, value);
    if (node.events?.onChange) {
      execute('onChange', { ...provides, [fieldKey]: value });
    }
  };

  if (!fieldKey) {
    return (
      <WrongConfig message='❌ Select missing fieldKey' type={node.type} />
    );
  }

  return (
    <FormField
      control={form.control}
      name={fieldKey}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <Select
            disabled={loading || form.formState.isSubmitting}
            onValueChange={handleValueChange}
            defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder || 'Sélection'} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Array.isArray(data)
                ? data.map((item: any) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
          <FormDescription />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
