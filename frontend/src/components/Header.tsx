"use client";

import { useEffect, useState } from "react";

import { useCredits } from "@/context/CreditsContext";

type HeaderProps = {
  onOpenCredits: () => void;
};

function initialTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }
  return localStorage.getItem("wm_theme") === "dark" ? "dark" : "light";
}

export function Header({ onOpenCredits }: HeaderProps) {
  const { balance } = useCredits();
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("wm_theme", theme);
  }, [theme]);

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
      <div>
        <h1 className="text-lg font-semibold">Watermarks Remover</h1>
        <p className="text-xs text-gray-500">Inspect and clean text, image, and document files</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded border border-gray-300 px-3 py-1 text-sm"
          onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
        >
          {theme === "light" ? "Dark" : "Light"} mode
        </button>
        <button type="button" className="rounded bg-slate-900 px-3 py-1 text-sm text-white" onClick={onOpenCredits}>
          Credits: {balance}
        </button>
      </div>
    </header>
  );
}
