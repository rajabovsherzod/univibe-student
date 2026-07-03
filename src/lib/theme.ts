"use client";

// globals.css: @variant dark (&:where(.dark-mode, .dark-mode *)) — so we toggle
// ".dark-mode" (not ".dark").
export const DARK_CLASS = "dark-mode";
export const LIGHT_CLASS = "light-mode";

/**
 * Switch the theme WITHOUT the "everything animates" flash.
 *
 * When the theme class flips, every element carrying a CSS transition
 * (transition-colors / transition-shadow / ring transitions on inputs, etc.)
 * animates its color from the old theme to the new one over its transition
 * duration — that's the "input hangs, then its color changes" glitch.
 *
 * We add a transient `disable-transitions` class to <html> that kills all
 * transitions for the single frame the theme swaps, then remove it after the
 * paint (double rAF) so normal hover/focus animations work again immediately.
 */
export function applyTheme(dark: boolean) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;

  html.classList.add("disable-transitions");

  if (dark) {
    html.classList.add(DARK_CLASS);
    html.classList.remove(LIGHT_CLASS);
  } else {
    html.classList.remove(DARK_CLASS);
    html.classList.add(LIGHT_CLASS);
  }

  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
    document.cookie = `theme=${dark ? "dark" : "light"};path=/;max-age=31536000;SameSite=Lax`;
  } catch {
    /* storage may be unavailable */
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => html.classList.remove("disable-transitions"));
  });
}
