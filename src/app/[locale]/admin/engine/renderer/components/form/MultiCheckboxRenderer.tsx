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
import { CheckedState } from '@radix-ui/react-checkbox';
import { useMemo } from 'react';
import WrongConfig from '../WrongConfig';

export function MultiCheckboxRenderer({
  node,
  provides = {}
}: IComponentRegistryProps) {
  const { control, setValue } = useFormContext();
  const { fieldName, params, data } = useComponentContext({
    node,
    provides
  });
  const { execute } = useExecuteTrigger({ node });

  const handleValueChange = (
    checked: CheckedState,
    itemValue: any,
    prevValue = []
  ) => {
    if (!fieldName) return;
    const values = checked
      ? [...prevValue, itemValue]
      : prevValue?.filter((value: any) => value !== itemValue);

    setValue(fieldName, values);
    if (node.events?.onChange) {
      execute('onChange', { ...provides, [fieldName]: values });
    }
  };

  const items = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return data;
  }, [data]);

  if (!fieldName) {
    return (
      <WrongConfig
        message='❌ MultiCheckbox missing fieldName'
        type={node.type}
      />
    );
  }

  return (
    <FormField
      control={control}
      name={fieldName}
      render={() => (
        <FormItem>
          <FormLabel>{params.label}</FormLabel>
          {items.map((item) => (
            <FormField
              key={item.value}
              control={control}
              name={fieldName}
              render={({ field }) => {
                return (
                  <FormItem
                    key={item.value}
                    className='flex flex-row items-center gap-2'>
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(item.value)}
                        onCheckedChange={(checked) =>
                          handleValueChange(checked, item.value, field.value)
                        }
                      />
                    </FormControl>
                    <FormLabel className='text-sm font-normal'>
                      {item.label}
                    </FormLabel>
                  </FormItem>
                );
              }}
            />
          ))}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
