'use client';

// import { useComponentRegistry } from './hooks/useComponentRegistry';
import { IPageVersion } from './interfaces';
import { ComponentRenderer } from './renderer/components/ComponentRenderer';

type Props = {
  page: IPageVersion;
};
export default function Preview({ page }: Props) {
  // useComponentRegistry();
  return <ComponentRenderer node={page.snapshot} />;
}
