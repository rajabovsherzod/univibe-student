"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/base/theme-toggle/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

/**
 * Shared auth screen: desktop split (brand illustration panel + form panel),
 * mobile brand→body-bg gradient. Login / signup share this so they stay in
 * perfect visual sync. `children` is the form card + anything below the heading.
 */
export function AuthShell({
  illustration,
  illustrationTitle,
  illustrationSubtitle,
  heading,
  subheading,
  contentMaxWidth = "400px",
  children,
}: {
  illustration: string;
  illustrationTitle: string;
  illustrationSubtitle: string;
  heading: string;
  subheading: React.ReactNode;
  contentMaxWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary lg:grid lg:grid-cols-[1.05fr_minmax(0,1fr)]">
      {/* ── LEFT — illustration (desktop only) ── */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-white/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-16 size-[26rem] rounded-full bg-brand-300/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:22px_22px]" />

        <div className="absolute left-9 top-9 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-white shadow-lg shadow-black/10">
            <Image src="/icon.svg" alt="" width={22} height={22} />
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            Uni<span className="text-white/70">vibe</span>
          </span>
        </div>

        <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
          <Image
            key={illustration}
            src={illustration}
            alt="Univibe"
            width={560}
            height={560}
            priority
            className="w-full drop-shadow-2xl"
          />
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold leading-tight text-white">{illustrationTitle}</h2>
            <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-white/80">{illustrationSubtitle}</p>
          </div>
        </div>
      </aside>

      {/* ── RIGHT — form ── */}
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-12
                       bg-gradient-to-b from-brand-600 to-bg-primary
                       lg:bg-none lg:bg-bg-primary">
        <div className="absolute right-5 top-5 z-20 flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="relative z-10 w-full" style={{ maxWidth: contentMaxWidth }}>
          <div className="mb-8 flex flex-col items-center gap-3.5">
            <Link
              href="/"
              className="flex size-14 items-center justify-center rounded-2xl bg-bg-secondary shadow-sm ring-1 ring-border-secondary outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:shadow-sm"
            >
              <Image src="/icon.svg" alt="Univibe" width={34} height={34} priority />
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-fg-primary">{heading}</h1>
              <p className="mt-1 text-sm text-fg-secondary">{subheading}</p>
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
