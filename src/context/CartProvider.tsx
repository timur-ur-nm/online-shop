import { useCallback, useMemo, useState, type ReactNode } from "react";
import { CartContext, type CartItem } from "./cart";
import type { Product } from "../data/db";

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return {
      items,
      isOpen,
      count,
      total,
      openCart,
      closeCart,
      addItem,
      removeItem,
      clear,
    };
  }, [items, isOpen, openCart, closeCart, addItem, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}