"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "8px 0",
        border: "none",
        background: "none",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        color: "var(--c-text-main)",
      }}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      {theme === "dark" ? "浅色模式" : "深色模式"}
    </button>
  );
}
