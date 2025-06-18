'use client';

import { IComponentRegistryProps } from '../../interfaces';
import { ComponentRenderer } from './ComponentRenderer';
import { useComponentContext } from '../../hooks/useComponentContext';
import WrongConfig from './WrongConfig';

export function ListRenderer({
  node,
  provides = {},
  bindings = {}
}: IComponentRegistryProps) {
  const { props, data } = useComponentContext({ node, provides });

  const indexAlias = props.indexAlias || 'index';

  if (!Array.isArray(data)) {
    return (
      <WrongConfig
        message='❌ ListRenderer requires data to be an array'
        type={node.type}
      />
    );
  }
  return (
    <div className='space-y-2'>
      {data.map((item, index) => {
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
