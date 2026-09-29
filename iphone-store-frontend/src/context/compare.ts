import { createContext, useContext } from "react";

export const COMPARE_MAX = 4;

export interface CompareValue {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  isFull: boolean;
}

export const CompareContext = createContext<CompareValue | null>(null);

export function useCompare(): CompareValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}