import { useCallback, useMemo, useState, type ReactNode } from "react";
import { RecentlyViewedContext, type RecentlyViewedValue } from "./recentlyViewed";
import { getProductById, type Product } from "../data/db";

const STORAGE_KEY = "recentlyViewedProducts";
const MAX_ITEMS = 6;

function load(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const ids: string[] = JSON.parse(raw);
    return ids.map(getProductById).filter((p): p is Product => Boolean(p));
  } catch {
    return [];
  }
}

export default function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(load);

  const track = useCallback((product: Product) => {
    setProducts((prev) => {
      const next = [product, ...prev.filter((p) => p.id !== product.id)].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(next.map((p) => p.id))
        );
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const value = useMemo<RecentlyViewedValue>(() => ({ products, track }), [products, track]);

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}