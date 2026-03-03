"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => { void error; }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-error-50 dark:bg-error-500/10 ring-8 ring-error-100 dark:ring-error-500/10">
        <svg className="size-10 text-error-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-fg-primary">Xatolik yuz berdi</h2>
        <p className="text-sm text-fg-tertiary max-w-sm leading-relaxed">
          Sahifani yuklab bo'lmadi. Qayta urinib ko'ring.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Qayta urinish
        </button>
        <button
          onClick={() => router.push("/login")}
          className="rounded-xl border border-border-secondary bg-bg-secondary px-5 py-2.5 text-sm font-semibold text-fg-primary hover:bg-bg-tertiary transition-colors"
        >
          Loginga qaytish
        </button>
      </div>
    </div>
  );
}
