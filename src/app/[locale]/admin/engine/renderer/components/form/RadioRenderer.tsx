'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useComponentContext } from '../../../hooks/useComponentContext';
import { IComponentRegistryProps } from '../../../interfaces';
import useExecuteTrigger from '../../../hooks/useExecuteTrigger';
import WrongConfig from '../WrongConfig';

export function RadioRenderer({ node, provides }: IComponentRegistryProps) {
  const form = useFormContext();
  const { fieldKey, params, data } = useComponentContext({ node, provides });
  const { execute } = useExecuteTrigger({ node });

  const handleValueChange = (value: string) => {
    if (!fieldKey) return;
    form.setValue(fieldKey, value);
    if (node.events?.onChange) {
      execute('onChange', { ...provides, [fieldKey]: value });
    }
  };

  if (!fieldKey)
    return <WrongConfig message='❌ Radio missing fieldKey' type={node.type} />;
  return (
    <FormField
      control={form.control}
      name={fieldKey}
      render={({ field }) => (
        <FormItem className='space-y-3'>
          {params.label ? <FormLabel>{params.label}</FormLabel> : null}
          <FormControl>
            <RadioGroup
              onValueChange={handleValueChange}
              defaultValue={field.value}
              className='flex flex-col'>
              {Array.isArray(data)
                ? data.map((item) => (
                    <FormItem
                      key={item.value}
                      className='flex items-center gap-3'>
                      <FormControl>
                        <RadioGroupItem value={item.value} />
                      </FormControl>
                      <FormLabel className='font-normal'>
                        {item.label}
                      </FormLabel>
                    </FormItem>
                  ))
                : null}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
