"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export function ThemeToaster() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.classList.contains("dark"));

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Toaster
      position="top-center"
      richColors
      theme={isDark ? "dark" : "light"}
    />
  );
}
