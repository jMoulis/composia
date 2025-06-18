'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { IComponentRegistryProps } from '../../../interfaces';
import { useComponentContext } from '../../../hooks/useComponentContext';
import { fr } from 'date-fns/locale';
import useExecuteTrigger from '../../../hooks/useExecuteTrigger';
import WrongConfig from '../WrongConfig';

export function DateRenderer({ node, provides }: IComponentRegistryProps) {
  const { props, fieldName, params } = useComponentContext({ node, provides });
  const { control, setValue } = useFormContext();
  const { execute } = useExecuteTrigger({ node });

  const handleValueChange = (value: any) => {
    if (!fieldName) return;
    setValue(fieldName, value);
    if (node.events?.onChange) {
      execute('onChange', { ...provides, [fieldName]: value });
    }
  };

  if (!fieldName)
    return <WrongConfig message='❌ Date missing fieldName' type={node.type} />;

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className='flex flex-col'>
          {params.label ? <FormLabel>{params.label}</FormLabel> : null}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}>
                  {field.value ? (
                    format(field.value, 'dd MMMM yyyy', {
                      locale: fr
                    })
                  ) : (
                    <span>{props.placeholder || 'Choisir une date'}</span>
                  )}
                  <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='single'
                locale={fr}
                selected={field.value}
                onSelect={handleValueChange}
                disabled={(date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
                captionLayout='dropdown'
              />
            </PopoverContent>
          </Popover>
          <FormDescription>{props.description || ''}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
