import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { RecentlyViewedContext, type RecentlyViewedValue } from "./recentlyViewed";
import { useProducts } from "./products";
import type { Product } from "../data/db";

const STORAGE_KEY = "recentlyViewedProducts";
const MAX_ITEMS = 6;

function loadIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const ids: string[] = JSON.parse(raw);
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

export default function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const { products } = useProducts();
  const [ids, setIds] = useState<string[]>(loadIds);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore storage errors
    }
  }, [ids]);

  const track = useCallback((product: Product) => {
    setIds((prev) => [product.id, ...prev.filter((id) => id !== product.id)].slice(0, MAX_ITEMS));
  }, []);

  const resolved = useMemo(
    () => ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p)),
    [ids, products]
  );

  const value = useMemo<RecentlyViewedValue>(() => ({ products: resolved, track }), [resolved, track]);

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}