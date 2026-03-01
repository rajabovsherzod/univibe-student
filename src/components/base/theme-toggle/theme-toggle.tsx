"use client";

import { useEffect, useState } from "react";
import { Sun, Moon01 } from "@untitledui/icons";

// globals.css: @variant dark (&:where(.dark-mode, .dark-mode *));
// So we must toggle ".dark-mode" — not ".dark".
const DARK_CLASS = "dark-mode";
const LIGHT_CLASS = "light-mode";

function setThemeCookie(value: "dark" | "light") {
  document.cookie = `theme=${value};path=/;max-age=31536000;SameSite=Lax`;
}

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains(DARK_CLASS));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains(DARK_CLASS));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    const html = document.documentElement;
    if (next) {
      html.classList.add(DARK_CLASS);
      html.classList.remove(LIGHT_CLASS);
    } else {
      html.classList.remove(DARK_CLASS);
      html.classList.add(LIGHT_CLASS);
    }
    localStorage.setItem("theme", next ? "dark" : "light");
    setThemeCookie(next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
      className={`flex size-9 items-center justify-center rounded-full border border-border-secondary bg-bg-secondary shadow-xs text-secondary hover:bg-bg-tertiary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${className ?? ""}`}
    >
      {isDark ? (
        <Sun className="size-4" />
      ) : (
        <Moon01 className="size-4" />
      )}
    </button>
  );
}
