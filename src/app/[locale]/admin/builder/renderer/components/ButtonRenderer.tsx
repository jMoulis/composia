import { Button } from '@/components/ui/button';
import { IComponentRegistryProps } from '../../interfaces';
import { ComponentRenderer } from './ComponentRenderer';
import { useComponentContext } from '../../hooks/useComponentContext';

export function ButtonRenderer({ node, provides }: IComponentRegistryProps) {
  const { props } = useComponentContext({ node, provides });

  return (
    <Button {...props}>
      {node.children?.map((child) => (
        <ComponentRenderer key={child.key} node={child} />
      ))}
    </Button>
  );
}
