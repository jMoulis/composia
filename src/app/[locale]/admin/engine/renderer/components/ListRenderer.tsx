'use client';

import { IComponentRegistryProps } from '../../interfaces';
import { ComponentRenderer } from './ComponentRenderer';
import { useComponentContext } from '../../hooks/useComponentContext';

export function ListRenderer({
  node,
  provides = {},
  bindings = {}
}: IComponentRegistryProps) {
  const { props, storeData } = useComponentContext({ node, provides });

  const list = storeData || [];

  const indexAlias = props.indexAlias || 'index';

  if (!Array.isArray(list)) {
    return (
      <div className='text-red-500'>
        Donnée non itérable à l&apos;emplacement
      </div>
    );
  }
  return (
    <div className='space-y-2'>
      {list.map((item, index) => {
        const iterationProvides = {
          ...provides,
          [indexAlias]: index
        };
        return (
          <div key={item?._id || index}>
            {node.children?.map((child) => (
              <ComponentRenderer
                key={child.key}
                node={child}
                contextProvides={iterationProvides}
                contextBindings={bindings}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
