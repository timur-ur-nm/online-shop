import { createContext, useContext } from "react";
import type { AuthUser, ProfileData } from "../api/auth";

export interface AuthContextValue {
  isAuthenticated: boolean;
  username: string | null;
  user: AuthUser | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<AuthUser>;
  changePassword: (oldPassword: string, newPassword: string, confirm: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}