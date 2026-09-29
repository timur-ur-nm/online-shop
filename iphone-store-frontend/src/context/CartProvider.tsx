import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { CartContext, type CartItem } from "./cart";
import type { Product } from "../data/db";
import { useProducts } from "./products";
import { useAuth } from "./auth";
import {
  addCartItem,
  clearCart,
  deleteCartItem,
  fetchCart,
  updateCartItem,
  type ApiCartItem,
} from "../api/cart";
import { PRODUCT_IMAGE_FALLBACK } from "../api/client";

interface Line {
  lineId: number | null;
  product: Product;
  quantity: number;
}

function productFromServer(item: ApiCartItem, products: Product[]): Product {
  const full = products.find((p) => p.id === String(item.product));
  if (full) {
    return { ...full, image: item.product_image ?? full.image };
  }
  return {
    id: String(item.product),
    name: item.product_name,
    slug: item.product_slug,
    price: Number(item.product_price),
    image: item.product_image ?? PRODUCT_IMAGE_FALLBACK,
    stock: item.product_stock,
    inStock: item.product_stock > 0,
  };
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useProducts();
  const { accessToken } = useAuth();
  const [lines, setLines] = useState<Line[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const loadCart = useCallback(async () => {
    try {
      const cart = await fetchCart();
      setLines(
        cart.items.map((item) => ({
          lineId: item.id,
          product: productFromServer(item, products),
          quantity: item.quantity,
        }))
      );
    } catch {
      setLines([]);
    }
  }, [products]);

  useEffect(() => {
    let cancelled = false;
    fetchCart()
      .then((cart) => {
        if (cancelled) return;
        setLines(
          cart.items.map((item) => ({
            lineId: item.id,
            product: productFromServer(item, products),
            quantity: item.quantity,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setLines([]);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, products]);

  useEffect(() => {
    const onFocus = () => {
      void loadCart();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadCart]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const openCheckout = useCallback(() => {
    setCheckoutOpen(true);
    setIsOpen(false);
  }, []);
  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);

  const addItem = useCallback(
    async (product: Product, quantity = 1) => {
      const rollback = lines;
      const existing = lines.find((l) => l.product.id === product.id);
      setLines(
        existing
          ? lines.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + quantity } : l))
          : [...lines, { lineId: null, product, quantity }]
      );
      try {
        const serverItem = existing?.lineId
          ? await updateCartItem(existing.lineId, existing.quantity + quantity)
          : await addCartItem(Number(product.id), quantity);
        setLines((prev) =>
          prev.map((l) =>
            l.product.id === product.id
              ? { ...l, lineId: serverItem.id, quantity: serverItem.quantity }
              : l
          )
        );
      } catch {
        setLines(rollback);
      }
    },
    [lines]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const line = lines.find((l) => l.product.id === productId);
      if (quantity <= 0) {
        if (!line) return;
        setLines(lines.filter((l) => l.product.id !== productId));
        if (line.lineId === null || line.lineId === undefined) return;
        try {
          await updateCartItem(line.lineId, 0);
        } catch {
          setLines((prev) => [line, ...prev]);
        }
        return;
      }
      const rollback = lines;
      setLines(lines.map((l) => (l.product.id === productId ? { ...l, quantity } : l)));
      try {
        const serverItem = line?.lineId
          ? await updateCartItem(line.lineId, quantity)
          : await addCartItem(Number(productId), quantity);
        setLines((prev) =>
          prev.map((l) =>
            l.product.id === productId
              ? { ...l, lineId: serverItem.id, quantity: serverItem.quantity }
              : l
          )
        );
      } catch {
        setLines(rollback);
      }
    },
    [lines]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      const line = lines.find((l) => l.product.id === productId);
      if (!line) return;
      const rollback = lines;
      setLines(lines.filter((l) => l.product.id !== productId));
      if (line.lineId === null || line.lineId === undefined) return;
      try {
        await deleteCartItem(line.lineId);
      } catch {
        setLines(rollback);
      }
    },
    [lines]
  );

  const clear = useCallback(async () => {
    setLines([]);
    try {
      await clearCart();
    } catch {
      // keep local state empty
    }
  }, []);

  const items = useMemo<CartItem[]>(
    () => lines.map(({ product, quantity }) => ({ product, quantity })),
    [lines]
  );

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return {
      items,
      isOpen,
      count,
      total,
      checkoutOpen,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      addItem,
      removeItem,
      clear,
      updateQuantity,
    };
  }, [items, isOpen, checkoutOpen, openCart, closeCart, openCheckout, closeCheckout, addItem, removeItem, clear, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}