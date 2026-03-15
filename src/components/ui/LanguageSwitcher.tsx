"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation, LOCALE_LABELS, type Locale } from "@/lib/i18n/i18n";

const locales: Locale[] = ["uz", "en", "ru"];

// ── Professional SVG Flag Icons (4x3 aspect ratio, rounded) ────────────

function FlagUZ({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="160" fill="#1EB53A" />
      <rect width="640" height="160" y="160" fill="#fff" />
      <rect width="640" height="160" y="320" fill="#0099B5" />
      <rect width="640" height="6" y="157" fill="#CE1126" />
      <rect width="640" height="6" y="317" fill="#CE1126" />
      <circle cx="180" cy="80" r="45" fill="#fff" />
      <circle cx="195" cy="80" r="40" fill="#1EB53A" />
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const cx = 280 + 8 * Math.cos(angle);
        const cy = 80 + 8 * Math.sin(angle);
        return <circle key={i} cx={cx.toFixed(2)} cy={cy.toFixed(2)} r="4" fill="#fff" />;
      })}
    </svg>
  );
}

function FlagEN({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="480" fill="#012169" />
      <path d="M0 0l640 480M640 0L0 480" stroke="#fff" strokeWidth="80" />
      <path d="M0 0l640 480M640 0L0 480" stroke="#C8102E" strokeWidth="52" />
      <path d="M320 0v480M0 240h640" stroke="#fff" strokeWidth="120" />
      <path d="M320 0v480M0 240h640" stroke="#C8102E" strokeWidth="72" />
    </svg>
  );
}

function FlagRU({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="160" fill="#fff" />
      <rect width="640" height="160" y="160" fill="#0039A6" />
      <rect width="640" height="160" y="320" fill="#D52B1E" />
    </svg>
  );
}

const FLAG_COMPONENTS: Record<Locale, React.FC<{ className?: string }>> = {
  uz: FlagUZ,
  en: FlagEN,
  ru: FlagRU,
};

// ── LanguageSwitcher ───────────────────────────────────────────────────

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const CurrentFlag = FLAG_COMPONENTS[locale];

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-fg-secondary hover:bg-bg-tertiary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label="Change language"
      >
        <span className="size-5 rounded-[3px] overflow-hidden ring-1 ring-black/10 shrink-0">
          <CurrentFlag className="size-full object-cover" />
        </span>
        <span className="text-xs font-semibold tracking-wide">{locale.toUpperCase()}</span>
        <svg className={`size-3.5 text-fg-quaternary transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[180px] rounded-xl bg-bg-secondary border border-border-secondary shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {locales.map((l) => {
            const Flag = FLAG_COMPONENTS[l];
            const isActive = locale === l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => { setLocale(l); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${isActive
                    ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-semibold"
                    : "text-fg-secondary hover:bg-bg-tertiary font-medium"
                  }`}
              >
                <span className="size-5 rounded-[3px] overflow-hidden ring-1 ring-black/10 shrink-0">
                  <Flag className="size-full object-cover" />
                </span>
                <span className="flex-1 text-left">{LOCALE_LABELS[l].label}</span>
                {isActive && (
                  <svg className="size-4 text-brand-600 dark:text-brand-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
