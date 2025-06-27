"use client";

import { useTheme } from "@/hooks/useTheme";
import { useEffect } from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme
  useTheme();

  return <>{children}</>;
}
