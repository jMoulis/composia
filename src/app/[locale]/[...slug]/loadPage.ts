import { notFound } from "next/navigation";
import { matchRoute } from "./matchRouter";
import { getDocument } from "@/lib/mongodb/actions";
import { IPageVersion } from "../admin/engine/interfaces";
import { SYSTEM_COLLECTIONS } from "@/lib/mongodb/system-collections";
import { ObjectId } from "mongodb";
import { resolvedNode, resolveStores } from "./runtimeResolvers";
import { testPage } from './testPage';

export async function loadPage(slug: string[], fake = false) {
  const slugsSystem = ['.well-known', 'appspecific', 'com.chrome.devtools.json'];


  const isValidSlug = (slug: string) => {
    // Check if the slug is a system slug
    return !slugsSystem.includes(slug) && !slug.startsWith('_');
  };

  const filteredSlug = slug.filter(isValidSlug);
  const { page, params } = await matchRoute(filteredSlug);

  if (!page?.publishedVersionId) {
    notFound();
  }

  let publishedVersion: IPageVersion | null = null;
  if (fake) {
    // Use a fake page version for testing purposes
    publishedVersion = testPage;
  } else {

    publishedVersion = await getDocument<IPageVersion>(
      SYSTEM_COLLECTIONS.PAGE_VERSIONS,
      {
        _id: ObjectId.createFromHexString(page.publishedVersionId)
      }
    );
  }
  if (!publishedVersion) {
    notFound();
  }

  const resolvedStores = await resolveStores(publishedVersion.stores || [], {
    routeParams: params
  });

  const contextProvides = {
    routeParams: params,
    stores: resolvedStores
  };

  const tree = await resolvedNode(
    publishedVersion.snapshot,
    {},
    contextProvides
  );

  return {
    tree,
    contextProvides,
    resolvedStores,
  }
}