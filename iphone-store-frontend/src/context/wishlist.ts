import { createContext, useContext } from "react";

export interface WishlistValue {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
  count: number;
}

export const WishlistContext = createContext<WishlistValue | null>(null);

export function useWishlist(): WishlistValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}