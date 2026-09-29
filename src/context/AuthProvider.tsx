import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  authFetch,
  clearTokens,
  fetchMe,
  getAccessToken,
  login as apiLogin,
  register as apiRegister,
  setTokens,
  type AuthUser,
} from "../api/auth";
import { AuthContext, type AuthContextValue } from "./auth";

const USERNAME_KEY = "auth_username";

function storedUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken());
  const [username, setUsername] = useState<string | null>(() => storedUsername());
  const [user, setUser] = useState<AuthUser | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authFetch("/auth/me/");
      if (!res.ok) return;
      const profile = (await res.json()) as AuthUser;
      setUser(profile);
      setUsername(profile.username);
      localStorage.setItem(USERNAME_KEY, profile.username);
    } catch {
      // keep current state
    }
  }, []);

  useEffect(() => {
    if (getAccessToken() === null) return;
    let cancelled = false;
    authFetch("/auth/me/")
      .then((res) => (res.ok ? (res.json() as Promise<AuthUser>) : null))
      .then((profile) => {
        if (cancelled || !profile) return;
        setUser(profile);
        setUsername(profile.username);
        localStorage.setItem(USERNAME_KEY, profile.username);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (userName: string, password: string) => {
      const tokens = await apiLogin(userName, password);
      setTokens(tokens);
      localStorage.setItem(USERNAME_KEY, userName);
      setAccessToken(tokens.access);
      setUsername(userName);
      setUser(null);
      try {
        const profile = await fetchMe(tokens.access);
        setUser(profile);
        setUsername(profile.username);
        localStorage.setItem(USERNAME_KEY, profile.username);
      } catch {
        // profile will be fetched later via refreshProfile
      }
    },
    []
  );

  const register = useCallback(async (userName: string, email: string, password: string) => {
    const result = await apiRegister(userName, email, password);
    setTokens({ access: result.access, refresh: result.refresh });
    localStorage.setItem(USERNAME_KEY, result.user.username);
    setAccessToken(result.access);
    setUsername(result.user.username);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    localStorage.removeItem(USERNAME_KEY);
    setAccessToken(null);
    setUsername(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: accessToken !== null,
      username,
      user,
      accessToken,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [accessToken, username, user, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}