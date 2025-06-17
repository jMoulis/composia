import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { IComponentRegistryProps } from '../../interfaces';
import { ComponentRenderer } from './ComponentRenderer';
import { useComponentContext } from '../../hooks/useComponentContext';

export function DialogRenderer({
  node,
  provides = {},
  bindings = {}
}: IComponentRegistryProps) {
  const { props } = useComponentContext({ node, provides });
  const { title, description, triggerText, ...rest } = props ?? {};

  return (
    <Dialog {...rest}>
      <DialogTrigger>{triggerText}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {node.children?.map((child) => (
          <ComponentRenderer
            key={child.key}
            node={child}
            contextBindings={bindings}
            contextProvides={provides}
          />
        ))}
      </DialogContent>
    </Dialog>
  );
}
