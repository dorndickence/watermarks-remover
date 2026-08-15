"use client";

import { CreditsProvider } from "@/context/CreditsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CreditsProvider>{children}</CreditsProvider>;
}
