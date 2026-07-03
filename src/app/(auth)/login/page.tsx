"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { useTranslation } from "@/lib/i18n/i18n";

const LoginSchema = z.object({
  email: z.string().email("Yaroqli elektron pochta kiriting"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
    // No auto-focus-ring flashing on the inputs when the Login button is clicked.
    shouldFocusError: false,
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Drop focus so no input keeps its focus/validation ring while we submit.
    if (typeof document !== "undefined") (document.activeElement as HTMLElement | null)?.blur?.();
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (!res?.ok || res.error) {
        const msg = res?.error === "CredentialsSignin"
          ? t("auth.errInvalidCredentials")
          : t("auth.errLoginFailed");
        toast.error(t("common.error"), { description: msg });
        return;
      }

      toast.success(t("common.success"), { description: t("auth.loginWelcome") });
      await update();
      await new Promise((resolve) => setTimeout(resolve, 150));
      window.location.href = "/";
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      illustration="/svgs/login.svg"
      illustrationTitle={t("auth.loginIllustrationTitle")}
      illustrationSubtitle={t("auth.loginIllustrationSubtitle")}
      heading={t("auth.login")}
      subheading={t("auth.loginWelcome")}
    >
          {/* card */}
          <div className="rounded-2xl border border-border-secondary bg-bg-secondary p-5 sm:p-7 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.12)]">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t("auth.email")}
                    placeholder={t("auth.emailPlaceholder")}
                    type="email"
                    isInvalid={!!formState.errors.email}
                    hint={formState.errors.email?.message}
                    isDisabled={isLoading}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={t("auth.password")}
                    placeholder={t("auth.passwordPlaceholder")}
                    type="password"
                    isInvalid={!!formState.errors.password}
                    hint={formState.errors.password?.message}
                    isDisabled={isLoading}
                  />
                )}
              />

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-brand-solid transition-colors hover:text-brand-700 outline-none focus-visible:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>

              <Button type="submit" className="mt-1 w-full" size="xl" isLoading={isLoading} isDisabled={isLoading}>
                {t("auth.loginButton")}
              </Button>
            </form>

            {/* divider */}
            <div className="relative my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border-secondary" />
              <span className="text-xs font-medium text-tertiary">{t("common.or")}</span>
              <div className="h-px flex-1 bg-border-secondary" />
            </div>

            {/* google */}
            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                try {
                  await signIn("google", { callbackUrl: "/" });
                } catch {
                  toast.error(t("common.error"));
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-bg-primary px-4 py-2.5 text-sm font-semibold text-primary ring-1 ring-border-primary ring-inset transition-colors hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t("auth.googleLogin")}
            </button>
          </div>

          {/* footer */}
          <p className="mt-6 text-center text-sm text-tertiary">
            {t("auth.noAccount")}{" "}
            <Link href="/signup" className="font-semibold text-brand-solid transition-colors hover:text-brand-700 hover:underline">
              {t("auth.signupLink")}
            </Link>
          </p>
    </AuthShell>
  );
}
