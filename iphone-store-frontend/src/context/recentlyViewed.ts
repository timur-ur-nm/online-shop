import { createContext, useContext } from "react";
import type { Product } from "../data/db";

export interface RecentlyViewedValue {
  products: Product[];
  track: (product: Product) => void;
}

export const RecentlyViewedContext = createContext<RecentlyViewedValue | null>(null);

export function useRecentlyViewed(): RecentlyViewedValue {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return ctx;
}