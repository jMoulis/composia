import { getDocument } from '@/lib/mongodb/actions';
import { matchRoute } from './matchRouter';
import { ObjectId } from 'mongodb';
import { notFound } from 'next/navigation';
import { IPageVersion } from '../admin/builder/interfaces';
import { SYSTEM_COLLECTIONS } from '@/lib/mongodb/system-collections';
import { ComponentRenderer } from '../admin/builder/renderer/components/ComponentRenderer';

const slugsSystem = ['.well-known', 'appspecific', 'com.chrome.devtools.json'];

const isValidSlug = (slug: string) => {
  // Check if the slug is a system slug
  return !slugsSystem.includes(slug) && !slug.startsWith('_');
};

export default async function Page({
  params
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { slug } = await params;
  const filteredSlug = slug.filter(isValidSlug);
  const { page } = await matchRoute(filteredSlug);
  if (!page?.publishedVersionId) {
    notFound();
  }

  const publishedVersion = await getDocument<IPageVersion>(
    SYSTEM_COLLECTIONS.PAGE_VERSIONS,
    {
      _id: ObjectId.createFromHexString(page.publishedVersionId)
    }
  );
  if (!publishedVersion) {
    notFound();
  }

  return <ComponentRenderer node={publishedVersion.snapshot} />;
}
