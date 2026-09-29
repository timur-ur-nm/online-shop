import type { Product } from "../data/db";
import iphoneImage from "../assets/iphone.png";
import macbookImage from "../assets/macbook.jpeg";
import ipadImage from "../assets/ipad.jpg";
import airpodsImage from "../assets/airpods.webp";
import appleWatchImage from "../assets/applewatch.webp";

export const API_BASE = "/api";

export const PRODUCT_IMAGE_FALLBACK = iphoneImage;

const CATEGORY_IMAGE_PREFIXES: Array<[string, string]> = [
  ["iphone", iphoneImage],
  ["macbook", macbookImage],
  ["ipad", ipadImage],
  ["airpods", airpodsImage],
  ["apple-watch", appleWatchImage],
];

const CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  headphones: airpodsImage,
  imac: macbookImage,
};

export function categoryImage(slug: string): string | null {
  const explicit = CATEGORY_IMAGE_BY_SLUG[slug];
  if (explicit) return explicit;
  const match = CATEGORY_IMAGE_PREFIXES.find(([prefix]) =>
    slug.startsWith(prefix)
  );
  return match ? match[1] : null;
}

function imageFor(a: ApiProduct): string {
  if (a.image) return a.image;
  return categoryImage(a.category_slug) ?? iphoneImage;
}

export interface ApiListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  article: string;
  category: string;
  category_slug: string;
  price: string;
  old_price: string | null;
  discount_percent: number;
  has_discount: boolean;
  condition: string;
  color: string;
  storage: number | null;
  rating: string;
  rating_count: number;
  image: string | null;
  stock: number;
  in_stock: boolean;
  description?: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  position?: number;
  products_count?: number;
  parent?: number | null;
  parent_slug?: string | null;
  level?: number;
  is_root?: boolean;
  breadcrumbs?: string[];
  children_count?: number;
  is_active?: boolean;
}

export interface ApiCategoryNode {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  position: number;
  products_count: number;
  is_active: boolean;
  children: ApiCategoryNode[];
}

export interface ApiBrand {
  id: number;
  name: string;
  slug: string;
}

export interface ApiFacets {
  categories: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    position?: number;
  }[];
  colors: string[];
  storages: number[];
  conditions: { value: string; label: string }[];
}

async function getJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(API_BASE + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

function toApiPagePath(next: string | null): string | null {
  if (!next) return null;
  const parsed = new URL(next);
  return parsed.pathname.replace(/^\/api/, "") + parsed.search;
}

async function getAllJson<T>(path: string, params?: Record<string, string>): Promise<T[]> {
  const out: T[] = [];
  let pagePath: string | null = path;
  const query = params ? new URLSearchParams(params).toString() : "";
  if (query) pagePath += `?${query}`;
  while (pagePath) {
    const data = await getJson<ApiListResponse<T>>(pagePath);
    out.push(...data.results);
    pagePath = toApiPagePath(data.next);
  }
  return out;
}

export function toProduct(a: ApiProduct): Product {
  return {
    id: String(a.id),
    name: a.name,
    slug: a.slug,
    article: a.article,
    price: Number(a.price),
    oldPrice: a.old_price !== null ? Number(a.old_price) : undefined,
    ratingCount: a.rating_count,
    rating: Number(a.rating),
    inStock: a.in_stock,
    stock: a.stock,
    category: a.category_slug,
    color: a.color,
    storage: a.storage ?? undefined,
    condition: a.condition,
    image: imageFor(a),
    description: a.description,
  };
}

export async function fetchProducts(params?: Record<string, string>): Promise<Product[]> {
  const data = await getAllJson<ApiProduct>("/products/", params);
  return data.map(toProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const data = await getJson<ApiProduct>(`/products/${slug}/`);
  return toProduct(data);
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  return getAllJson<ApiCategory>("/categories/");
}

export async function fetchCategoryTree(): Promise<ApiCategoryNode[]> {
  return getAllJson<ApiCategoryNode>("/categories/tree/");
}

export async function fetchCategoryById(id: number | string): Promise<ApiCategory> {
  return getJson<ApiCategory>(`/categories/${id}/`);
}

export async function fetchBrands(): Promise<ApiBrand[]> {
  return getAllJson<ApiBrand>("/brands/");
}

export async function fetchBrandById(id: number | string): Promise<ApiBrand> {
  return getJson<ApiBrand>(`/brands/${id}/`);
}

export async function fetchFacets(): Promise<ApiFacets> {
  return getJson<ApiFacets>("/products/facets/");
}