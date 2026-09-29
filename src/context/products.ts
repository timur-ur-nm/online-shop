import { createContext, useContext } from "react";
import type { Product } from "../data/db";
import type { ApiBrand, ApiCategory, ApiCategoryNode, ApiFacets } from "../api/client";

export interface ProductsValue {
  products: Product[];
  categories: ApiCategory[];
  categoryTree: ApiCategoryNode[];
  brands: ApiBrand[];
  facets: ApiFacets;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export const EMPTY_FACETS: ApiFacets = {
  categories: [],
  colors: [],
  storages: [],
  conditions: [],
};

export const ProductsContext = createContext<ProductsValue | null>(null);

export function useProducts(): ProductsValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}