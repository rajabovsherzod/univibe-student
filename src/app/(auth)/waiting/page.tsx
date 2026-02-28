"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { ClockCountdown, SignOut } from "@phosphor-icons/react";
import { useStudentMe } from "@/hooks/api/use-profile";
import { ThemeToggle } from "@/components/base/theme-toggle/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/i18n";

export default function WaitingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { status: authStatus } = useSession();
  const { data: me } = useStudentMe();

  useEffect(() => { if (authStatus === "unauthenticated") router.push("/login"); }, [authStatus, router]);
  useEffect(() => { if (me?.status === "approved") router.push("/"); }, [me, router]);

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="size-8 border-2 border-brand-solid border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg-primary flex items-center justify-center px-4 py-8 overflow-hidden">
      <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <Image src="/icon.svg" alt="" width={480} height={480} className="opacity-[0.035] dark:opacity-[0.05]" priority />
      </div>
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-6">
          <Image src="/icon.svg" alt="Univibe" width={56} height={56} priority className="mx-auto" />
        </div>

        <div className="rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-8">
          <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10 border-[8px] border-amber-100 dark:border-amber-500/20">
            <ClockCountdown size={40} weight="duotone" className="text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-primary mb-2">{t("waiting.title")}</h1>
          <p className="text-sm text-tertiary leading-relaxed mb-6">{t("waiting.description")}</p>

          {me && (
            <div className="rounded-xl bg-bg-primary border border-border-secondary p-4 mb-6">
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-tertiary">{t("waiting.nameLabel")}</span>
                  <span className="text-sm font-semibold text-primary">{me.full_name || `${me.name} ${me.surname}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-tertiary">{t("waiting.emailLabel")}</span>
                  <span className="text-sm font-semibold text-primary">{me.email}</span>
                </div>
                {me.university_name && (
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-tertiary">{t("waiting.universityLabel")}</span>
                    <span className="text-sm font-semibold text-primary">{me.university_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-tertiary">{t("waiting.statusLabel")}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full">
                    <ClockCountdown size={12} weight="fill" />
                    {t("waiting.statusWaited")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="inline-flex items-center gap-2 text-sm font-medium text-tertiary hover:text-error-600 dark:hover:text-error-400 transition-colors">
            <SignOut size={16} />
            {t("waiting.switchAccount")}
          </button>
        </div>
      </div>
    </div>
  );
}
