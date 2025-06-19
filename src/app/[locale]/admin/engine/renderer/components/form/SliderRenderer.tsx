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
import { Slider } from '@/components/ui/slider';
import WrongConfig from '../WrongConfig';

export function SliderRenderer({
  node,
  provides = {}
}: IComponentRegistryProps) {
  const { props, fieldKey, params } = useComponentContext({ node, provides });
  const { control, setValue } = useFormContext();
  const { execute } = useExecuteTrigger({ node });

  const handleValueChange = (values: number[]) => {
    if (!fieldKey) return;
    setValue(fieldKey, values);
    if (node.events?.onChange) {
      execute('onChange', { ...provides, [fieldKey]: values[0] });
    }
  };

  if (!fieldKey)
    return (
      <WrongConfig message='❌ Slider missing fieldKey' type={node.type} />
    );

  return (
    <FormField
      control={control}
      name={fieldKey}
      render={({ field }) => (
        <FormItem>
          {params.label ? <FormLabel>{params.label}</FormLabel> : null}
          <div className='flex'>
            <FormControl>
              <Slider
                min={props.min}
                max={props.max}
                className={props.className}
                onValueChange={handleValueChange}
                value={
                  Array.isArray(field.value)
                    ? field.value
                    : [field.value || props.defaultValue || 0]
                }
                step={props.step || 1}
              />
            </FormControl>
            <span className='text-xs mx-2'>{field.value}</span>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
