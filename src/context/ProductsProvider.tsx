import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  fetchBrands,
  fetchCategories,
  fetchCategoryTree,
  fetchFacets,
  fetchProducts,
  type ApiBrand,
  type ApiCategory,
  type ApiCategoryNode,
  type ApiFacets,
} from "../api/client";
import { EMPTY_FACETS, ProductsContext, type ProductsValue } from "./products";
import type { Product } from "../data/db";

export default function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoryTree, setCategoryTree] = useState<ApiCategoryNode[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [facets, setFacets] = useState<ApiFacets>(EMPTY_FACETS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchProducts(), fetchFacets(), fetchCategories(), fetchCategoryTree(), fetchBrands()])
      .then(([list, facetData, cats, tree, brs]) => {
        if (cancelled) return;
        setProducts(list);
        setFacets(facetData);
        setCategories(cats);
        setCategoryTree(tree);
        setBrands(brs);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchProducts(), fetchFacets(), fetchCategories(), fetchCategoryTree(), fetchBrands()])
      .then(([list, facetData, cats, tree, brs]) => {
        setProducts(list);
        setFacets(facetData);
        setCategories(cats);
        setCategoryTree(tree);
        setBrands(brs);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<ProductsValue>(
    () => ({ products, categories, categoryTree, brands, facets, loading, error, reload }),
    [products, categories, categoryTree, brands, facets, loading, error, reload]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}