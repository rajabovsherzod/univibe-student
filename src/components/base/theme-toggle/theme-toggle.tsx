"use client";

import { useEffect, useState } from "react";
import { Sun, Moon01 } from "@untitledui/icons";

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
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
