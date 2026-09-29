import { authFetch } from "./auth";

export interface ApiCartItem {
  id: number;
  product: number;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  product_price: string;
  product_stock: number;
  quantity: number;
  total_price: string;
}

export interface ApiCart {
  id: number;
  items: ApiCartItem[];
  total_quantity: number;
  total_price: string;
  updated_at?: string;
}

export interface ApiCartSummary {
  total_quantity: number;
  total_price: string;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await authFetch(path);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

async function sendJson<T>(path: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const res = await authFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function fetchCart(): Promise<ApiCart> {
  return getJson<ApiCart>("/cart/");
}

export function fetchCartSummary(): Promise<ApiCartSummary> {
  return getJson<ApiCartSummary>("/cart/summary/");
}

export function addCartItem(product: number, quantity: number): Promise<ApiCartItem> {
  return sendJson<ApiCartItem>("/cart/", "POST", { product, quantity });
}

export function updateCartItem(id: number, quantity: number): Promise<ApiCartItem> {
  return sendJson<ApiCartItem>(`/cart/${id}/`, "PATCH", { quantity });
}

export function deleteCartItem(id: number): Promise<void> {
  return sendJson<void>(`/cart/${id}/`, "DELETE");
}

export function clearCart(): Promise<void> {
  return sendJson<void>("/cart/clear/", "POST", {});
}