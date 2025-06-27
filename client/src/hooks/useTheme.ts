import { useEffect } from "react";
import { useUiStore } from "@/store/uiStore";

export const useTheme = () => {
  const { isDarkMode, setIsDarkMode, toggleDarkMode } = useUiStore();

  useEffect(() => {
    // Check for system preference on first load if no user preference is set
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("ui-store");
      if (!storedTheme) {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setIsDarkMode(systemPrefersDark);
      }
    }
  }, [setIsDarkMode]);

  useEffect(() => {
    // Apply theme to document
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [isDarkMode]);

  return {
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode,
  };
};
