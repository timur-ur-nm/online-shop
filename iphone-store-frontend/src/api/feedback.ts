import { API_BASE } from "./client";

export interface ApiSubscriber {
  email: string;
  created_at: string;
}

export interface ApiFeedbackMessage {
  id: number;
  kind: "feedback" | "cheaper";
  name: string;
  email: string;
  phone: string;
  message: string;
  product: number | null;
  product_name: string;
  created_at: string;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export function subscribeEmail(email: string): Promise<ApiSubscriber> {
  return postJson<ApiSubscriber>("/feedback/subscribe/", { email });
}

export interface SendFeedbackPayload {
  kind: "feedback" | "cheaper";
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  product?: number;
}

export function sendFeedback(payload: SendFeedbackPayload): Promise<ApiFeedbackMessage> {
  return postJson<ApiFeedbackMessage>("/feedback/messages/", payload);
}