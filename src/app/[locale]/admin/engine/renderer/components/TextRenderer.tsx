'use client';

import { cn } from '@/lib/utils';
import { IComponentRegistryProps } from '../../interfaces';
import { useComponentContext } from '../../hooks/useComponentContext';

export function TextRenderer({ node, provides = {} }: IComponentRegistryProps) {
  const { props, params } = useComponentContext({ node, provides });
  const { variant = 'p', className, ...rest } = props ?? {};
  const { text } = params;
  const VariantTag = `${variant}` as any;

  return (
    <VariantTag className={cn('text-base', className)} {...rest}>
      {text}
    </VariantTag>
  );
}
