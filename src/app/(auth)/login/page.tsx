"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { ThemeToggle } from "@/components/base/theme-toggle/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/i18n";

const LoginSchema = z.object({
  email: z.string().email("Yaroqli elektron pochta kiriting"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (res?.error) {
        const msg = res.error === "CredentialsSignin"
          ? "Email yoki parol noto'g'ri."
          : res.error;
        toast.error(t("common.error"), { description: msg });
      } else {
        toast.success(t("common.success"), {
          description: t("auth.loginWelcome"),
        });
        router.push("/");
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12 overflow-hidden">

      {/* Watermark */}
      <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <Image src="/icon.svg" alt="" width={480} height={480} className="opacity-[0.035] dark:opacity-[0.05]" priority />
      </div>

      {/* Top bar */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Link href="/" className="flex items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <Image src="/icon.svg" alt="Univibe" width={56} height={56} priority />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-primary">{t("auth.login")}</h1>
            <p className="mt-1 text-sm text-tertiary">{t("auth.loginWelcome")}</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-7">
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

            <div className="flex items-center justify-between gap-2">
              <Checkbox
                isSelected={rememberMe}
                onChange={setRememberMe}
                isDisabled={isLoading}
                label={t("auth.rememberMe")}
                size="sm"
              />
              <Link href="/forgot-password" className="text-sm font-semibold text-brand-solid hover:text-brand-700 transition-colors outline-none focus-visible:underline">
                {t("auth.forgotPassword")}
              </Link>
            </div>

            <Button type="submit" className="w-full mt-1" size="xl" isLoading={isLoading} isDisabled={isLoading}>
              {t("auth.loginButton")}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border-secondary" />
            <span className="text-xs font-medium text-tertiary">{t("common.or")}</span>
            <div className="flex-1 h-px bg-border-secondary" />
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-tertiary">
          {t("auth.noAccount")}{" "}
          <Link href="/signup" className="font-semibold text-brand-solid hover:text-brand-700 hover:underline transition-colors">
            {t("auth.signupLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
