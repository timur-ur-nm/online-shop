import type { ApiCategoryNode } from "../api/client";
import type { Product } from "../data/db";

function findNode(tree: ApiCategoryNode[], slug: string): ApiCategoryNode | null {
  const stack = [...tree];
  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    if (node.slug === slug) return node;
    stack.push(...node.children);
  }
  return null;
}

export function expandCategorySlugs(tree: ApiCategoryNode[], slug: string): Set<string> | null {
  const root = findNode(tree, slug);
  if (!root) return null;
  const slugs = new Set<string>([root.slug]);
  const queue = [...root.children];
  while (queue.length) {
    const node = queue.pop();
    if (!node) continue;
    slugs.add(node.slug);
    queue.push(...node.children);
  }
  return slugs;
}

export function computeCategoryCounts(
  tree: ApiCategoryNode[],
  products: Product[]
): Map<string, number> {
  const counts = new Map<string, number>();
  const stack: ApiCategoryNode[] = [...tree];
  const nodes: ApiCategoryNode[] = [];
  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    nodes.push(node);
    stack.push(...node.children);
  }
  for (const node of nodes) {
    const slugs = expandCategorySlugs(tree, node.slug);
    if (!slugs) continue;
    let count = 0;
    for (const product of products) {
      if (product.category && slugs.has(product.category)) count += 1;
    }
    counts.set(node.slug, count);
  }
  return counts;
}