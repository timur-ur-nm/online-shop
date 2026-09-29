import { authFetch } from "./auth";
import type { ApiListResponse } from "./client";

export interface ApiOrderItem {
  id?: number;
  product?: number;
  product_name?: string;
  product_slug?: string;
  quantity?: number;
  price?: string;
}

export interface ApiOrder {
  id: number;
  number: string;
  status?: string;
  created_at?: string;
  total_price?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  payment_method?: string;
  comment?: string;
  items?: ApiOrderItem[];
}

export interface CreateOrderPayload {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  comment?: string;
  payment_method: "card" | "cash" | "yandex" | "sbp";
}

async function getOrderJson<T>(path: string): Promise<T> {
  const res = await authFetch(path);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

async function sendOrderJson<T>(path: string, method: "POST", body: unknown): Promise<T> {
  const res = await authFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchOrders(): Promise<ApiOrder[]> {
  const data = await getOrderJson<ApiListResponse<ApiOrder>>("/orders/");
  return data.results;
}

export function fetchOrder(number: string): Promise<ApiOrder> {
  return getOrderJson<ApiOrder>(`/orders/${number}/`);
}

export function createOrder(payload: CreateOrderPayload): Promise<ApiOrder> {
  return sendOrderJson<ApiOrder>("/orders/", "POST", payload);
}

export interface CreateQuickOrderPayload {
  product_id: number;
  quantity?: number;
  phone: string;
  full_name?: string;
  comment?: string;
}

export async function createQuickOrder(payload: CreateQuickOrderPayload): Promise<ApiOrder> {
  const res = await fetch(`/api/orders/quick/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<ApiOrder>;
}

export function cancelOrder(number: string): Promise<void> {
  return sendOrderJson<void>(`/orders/${number}/cancel/`, "POST", {});
}