"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { estimateCost, getPricing } from "@/services/credits";
import type {
  CleaningOptions,
  CreditHistoryEntry,
  CreditKind,
  CreditPricing,
} from "@/services/credits";

type CreditsState = {
  balance: number;
  pricing: CreditPricing;
  history: CreditHistoryEntry[];
  estimate: (kind: CreditKind, options: CleaningOptions) => number;
  canAfford: (cost: number) => boolean;
  topUp: (amount: number) => void;
  deduct: (cost: number, reason: string) => void;
};

const STORAGE_KEY = "wm_frontend_credits";
const INITIAL_CREDITS = Number(process.env.NEXT_PUBLIC_CREDITS_INITIAL_BALANCE ?? 50);

function readStoredCredits(): { balance: number; history: CreditHistoryEntry[] } {
  if (typeof window === "undefined") {
    return { balance: INITIAL_CREDITS, history: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { balance: INITIAL_CREDITS, history: [] };
    }
    const parsed = JSON.parse(raw) as { balance?: number; history?: CreditHistoryEntry[] };
    return {
      balance: typeof parsed.balance === "number" ? parsed.balance : INITIAL_CREDITS,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { balance: INITIAL_CREDITS, history: [] };
  }
}

const CreditsContext = createContext<CreditsState | undefined>(undefined);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(() => readStoredCredits());
  const pricing = useMemo(() => getPricing(), []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const appendEntry = useCallback((delta: number, reason: string, newBalance: number) => {
    const entry: CreditHistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      delta,
      reason,
      balanceAfter: newBalance,
    };
    setState((prev) => ({
      balance: newBalance,
      history: [entry, ...prev.history].slice(0, 100),
    }));
  }, []);

  const topUp = useCallback(
    (amount: number) => {
      if (amount <= 0) {
        return;
      }
      const next = state.balance + amount;
      appendEntry(amount, "Credit top-up", next);
    },
    [appendEntry, state.balance],
  );

  const deduct = useCallback(
    (cost: number, reason: string) => {
      if (cost <= 0) {
        return;
      }
      const next = Math.max(0, state.balance - cost);
      appendEntry(-cost, reason, next);
    },
    [appendEntry, state.balance],
  );

  const estimate = useCallback((kind: CreditKind, options: CleaningOptions) => estimateCost(kind, options), []);
  const canAfford = useCallback((cost: number) => state.balance >= cost, [state.balance]);

  return (
    <CreditsContext.Provider
      value={{
        balance: state.balance,
        pricing,
        history: state.history,
        estimate,
        canAfford,
        topUp,
        deduct,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error("useCredits must be used inside CreditsProvider");
  }
  return context;
}
