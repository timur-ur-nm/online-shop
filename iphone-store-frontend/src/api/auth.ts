import { API_BASE } from "./client";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

export interface RegisterResponse {
  user: AuthUser;
  access: string;
  refresh: string;
}

const ACCESS_KEY = "auth_access";
const REFRESH_KEY = "auth_refresh";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function postJson<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export async function login(username: string, password: string): Promise<AuthTokens> {
  return postJson<AuthTokens>("/auth/token/", { username, password });
}

export async function refreshToken(refresh: string): Promise<AuthTokens> {
  return postJson<AuthTokens>("/auth/token/refresh/", { refresh });
}

export async function register(username: string, email: string, password: string): Promise<RegisterResponse> {
  return postJson<RegisterResponse>("/auth/register/", {
    username,
    email,
    password,
    password_confirm: password,
  });
}

export async function fetchMe(token: string | null): Promise<AuthUser> {
  const res = await fetch(API_BASE + "/auth/me/", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<AuthUser>;
}

export interface ProfileData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export async function updateProfile(data: ProfileData): Promise<AuthUser> {
  const res = await authFetch("/auth/me/", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const error = new Error(`API error ${res.status}`) as Error & { data?: unknown };
    error.data = body;
    throw error;
  }
  return res.json() as Promise<AuthUser>;
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
  newPasswordConfirm: string
): Promise<void> {
  const res = await authFetch("/auth/change-password/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const error = new Error(`API error ${res.status}`) as Error & { data?: unknown };
    error.data = body;
    throw error;
  }
}

async function refreshAccess(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const tokens = await refreshToken(refresh);
    setTokens(tokens);
    return tokens.access;
  } catch {
    clearTokens();
    return null;
  }
}

export async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const request = async (token: string | null): Promise<Response> => {
    const res = await fetch(API_BASE + path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return res;
  };

  const res = await request(getAccessToken());
  if (res.status !== 401) return res;

  const newAccess = await refreshAccess();
  if (!newAccess) return res;
  return request(newAccess);
}