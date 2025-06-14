import { IComponentRegistryProps } from '../../interfaces';
import { ComponentRenderer } from './ComponentRenderer';

export function BlockRenderer({ node }: IComponentRegistryProps) {
  const { variant = 'div', className = '', ...rest } = node.props ?? {};
  const VariantTag = `${variant}` as any;
  return (
    <VariantTag className={className} {...rest}>
      {node.children?.map((child) => (
        <ComponentRenderer key={child.key} node={child} />
      ))}
    </VariantTag>
  );
}
