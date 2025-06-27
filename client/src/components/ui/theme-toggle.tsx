"use client";

import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { motion } from "framer-motion";

interface ThemeToggleProps {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "ghost" | "outline";
}

export function ThemeToggle({
  size = "default",
  variant = "ghost",
}: ThemeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleDarkMode}
      className="relative overflow-hidden"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isDarkMode ? 0 : 1,
          opacity: isDarkMode ? 0 : 1,
          rotate: isDarkMode ? 180 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="h-4 w-4" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          scale: isDarkMode ? 1 : 0,
          opacity: isDarkMode ? 1 : 0,
          rotate: isDarkMode ? 0 : -180,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="h-4 w-4" />
      </motion.div>

      {/* Invisible content to maintain button size */}
      <span className="opacity-0">
        <Sun className="h-4 w-4" />
      </span>
    </Button>
  );
}
