/** Credits to my best friend Chatty */

import { getAllDocuments } from "@/lib/mongodb/actions";
import { IPage } from "../admin/engine/interfaces";
import { SYSTEM_COLLECTIONS } from "@/lib/mongodb/system-collections";

interface RouteNode {
  segment: string;
  children: Map<string, RouteNode>;
  dynamicChild?: RouteNode;
  page?: IPage;
  // If this is a dynamic node, store its parameter name.
  paramName?: string;
}

const isValidParam = (param: string): boolean => !param.includes(':');
const areParamsValid = (params: Record<string, string>): boolean => {
  return Object.values(params).every(isValidParam);
};
/**
 * Given a list of segments, expand them into all combinations
 * where optional segments (ending with '?') may be omitted.
 *
 * For example, for ['blog', ':category?', ':postId'] it returns:
 * [
 *   ['blog', ':category', ':postId'], // including the optional segment
 *   ['blog', ':postId']               // omitting the optional segment
 * ]
 */
function expandSegments(segments: string[]): string[][] {
  if (segments.length === 0) return [[]];
  const [first, ...rest] = segments;
  const restExpanded = expandSegments(rest);
  const result: string[][] = [];
  if (first.endsWith('?')) {
    // Remove the '?' when including the segment.
    const segment = first.slice(0, -1);
    // Option 1: include the segment.
    for (const r of restExpanded) {
      result.push([segment, ...r]);
    }
    // Option 2: omit the segment.
    result.push(...restExpanded);
  } else {
    for (const r of restExpanded) {
      result.push([first, ...r]);
    }
  }
  return result;
}

/**
 * Build a route tree from all pages. For each page, we first expand its route
 * (taking optional segments into account) and then insert each expanded branch into the tree.
 */
function buildRouteTree(pages: IPage[]): RouteNode {
  const root: RouteNode = { segment: '', children: new Map() };

  for (const page of pages) {
    // Split the route into segments, e.g. '/blog/:category?/:postId' → ['blog', ':category?', ':postId']
    const segments = page.context.route.split('/').filter(Boolean);
    const expandedRoutes = expandSegments(segments);

    for (const routeSegments of expandedRoutes) {
      let current = root;
      for (const segment of routeSegments) {
        if (segment.startsWith(':')) {
          // For dynamic segments, we follow (or create) a dynamicChild.
          if (!current.dynamicChild) {
            current.dynamicChild = {
              segment,
              children: new Map(),
              paramName: segment.slice(1),
            };
          }
          current = current.dynamicChild;
        } else {
          // For literal segments, use the children map.
          if (!current.children.has(segment)) {
            current.children.set(segment, { segment, children: new Map() });
          }
          current = current.children.get(segment)!;
        }
      }
      // When the full route is inserted, assign the page to this node.
      current.page = page;
    }
  }

  return root;
}

interface MatchResult {
  page: IPage;
  params: Record<string, string>;
  literalCount: number; // used to score specificity (more literal matches wins)
}

/**
 * Recursively search the tree for a matching route.
 *
 * The function attempts literal matches first (and increments a score)
 * and then dynamic matches. The result with the higher literalCount wins.
 */
function searchRoute(
  node: RouteNode,
  segments: string[],
  index: number,
  params: Record<string, string>,
  literalCount: number
): MatchResult | null {
  if (index === segments.length) {
    return node.page ? { page: node.page, params, literalCount } : null;
  }
  const segment = segments[index];
  let best: MatchResult | null = null;

  // Try literal match
  if (node.children.has(segment)) {
    const child = node.children.get(segment)!;
    const res = searchRoute(child, segments, index + 1, { ...params }, literalCount + 1);
    if (res) best = res;
  }

  // Then try dynamic match (only if the segment is a valid value, e.g. doesn't contain ':')
  if (node.dynamicChild && !segment.includes(':')) {
    const child = node.dynamicChild;
    const newParams = { ...params, [child.paramName!]: segment };
    const res = searchRoute(child, segments, index + 1, newParams, literalCount);
    if (res && (!best || res.literalCount > best.literalCount)) {
      best = res;
    }
  }
  return best;
}

/**
 * Main route matcher.
 * Given an array of URL segments (e.g. ['blog', 'sports', '123'])
 * and an organizationId, this function finds the matching page and extracts parameters.
 */
export async function matchRoute(
  segments: string[],
  // organizationId: string,
  // websiteId: string,
): Promise<{ page: IPage | null; params: Record<string, string> }> {
  // Fetch pages for this organization.
  const pages = await getAllDocuments<IPage>(SYSTEM_COLLECTIONS.PAGES);
  if (!pages || pages.length === 0) return { page: null, params: {} };

  // Build the tree (each page may have multiple branches if it uses optional segments).
  const root = buildRouteTree(pages);
  const finalMatch = searchRoute(root, segments.map((segment) => decodeURIComponent(segment)), 0, {}, 0);
  if (finalMatch && areParamsValid(finalMatch.params)) {
    return { page: finalMatch.page, params: finalMatch.params };
  }
  return { page: null, params: {} };
}
