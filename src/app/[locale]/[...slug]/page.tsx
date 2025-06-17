import { ComponentRenderer } from '../admin/engine/renderer/components/ComponentRenderer';
import { StoreProvider } from './stores/StoreContext';
import { loadPage } from './loadPage';

export default async function Page({
  params: routeParams
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { slug } = await routeParams;
  const { tree, contextProvides, resolvedStores } = await loadPage(slug, true);
  return (
    <>
      <StoreProvider stores={resolvedStores}>
        <ComponentRenderer node={tree} contextProvides={contextProvides} />
      </StoreProvider>
    </>
  );
}
