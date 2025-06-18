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
  FormMessage
} from '@/components/ui/form';
import {
  useFormContext,
  ControllerRenderProps,
  FieldValues
} from 'react-hook-form';
import { IComponentRegistryProps } from '../../interfaces';
import { useComponentContext } from '../../hooks/useComponentContext';
import useExecuteTrigger from '../../hooks/useExecuteTrigger';

export function SelectRenderer({
  node,
  provides = {}
}: IComponentRegistryProps) {
  const { props, params, data, fieldKey } = useComponentContext({
    node,
    provides
  });
  const { placeholder } = params;
  const { className = '' } = props;
  const { execute, loading } = useExecuteTrigger({ node });

  let formContext: ReturnType<typeof useFormContext> | null = null;

  try {
    const hook = useFormContext();
    formContext = hook;
  } catch {
    // Hors contexte formulaire
  }

  const handleValueChange = (
    value: string,
    field?: ControllerRenderProps<FieldValues, string>
  ) => {
    if (field) field.onChange(value);
    execute('onChange', { ...provides, value });
  };

  const renderOptions = () =>
    Array.isArray(data)
      ? data.map((item: any) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))
      : null;

  if (formContext && fieldKey) {
    // Mode FormField
    return (
      <FormField
        control={
          formContext.control as import('react-hook-form').Control<
            FieldValues,
            any,
            FieldValues
          >
        }
        name={fieldKey}
        render={({ field }) => (
          <FormItem>
            <Select
              disabled={loading || formContext!.formState.isSubmitting}
              onValueChange={(value) => handleValueChange(value, field)}
              defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className={className}>
                  <SelectValue placeholder={placeholder || 'Sélection'} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>{renderOptions()}</SelectContent>
            </Select>
            <FormDescription />
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Mode sans form
  return (
    <Select
      onValueChange={(value) => handleValueChange(value)}
      disabled={loading || formContext?.formState?.isSubmitting}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{renderOptions()}</SelectContent>
    </Select>
  );
}
