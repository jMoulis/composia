import { cn } from '@/lib/utils';
import { IComponentRegistryProps } from '../../interfaces';

export function TextRenderer({ node }: IComponentRegistryProps) {
  const { text, variant = 'p', className, ...rest } = node.props ?? {};
  const VariantTag = `${variant}` as any;
  return (
    <VariantTag className={cn('text-base', className)} {...rest}>
      {text}
    </VariantTag>
  );
}
