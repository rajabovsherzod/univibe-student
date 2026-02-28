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
import { Mail01, Lock01, LogIn01 } from "@untitledui/icons";

import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { SocialButton } from "@/components/base/buttons/social-button";
import { ThemeToggle } from "@/components/base/theme-toggle/theme-toggle";
import TelegramIcon from "@/components/foundations/social-icons/telegram";

const LoginSchema = z.object({
  email: z.string().email("Yaroqli elektron pochta kiriting"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
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
        toast.error("Xatolik", { description: "Email yoki parol noto'g'ri." });
      } else {
        toast.success("Tizimga kirdingiz!", {
          description: "Univibe platformasiga xush kelibsiz.",
        });
        router.push("/");
      }
    } catch {
      toast.error("Kutilmagan xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12 overflow-hidden">

      {/* Watermark */}
      <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <Image
          src="/icon.svg"
          alt=""
          width={480}
          height={480}
          className="opacity-[0.035] dark:opacity-[0.05]"
          priority
        />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Link
            href="/"
            className="flex items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Image src="/icon.svg" alt="Univibe" width={56} height={56} priority />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Tizimga kirish
            </h1>
            <p className="mt-1 text-sm text-tertiary">
              Univibe platformasiga xush kelibsiz
            </p>
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
                  label="Elektron pochta"
                  placeholder="student@univibe.uz"
                  type="email"
                  icon={Mail01}
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
                  label="Parol"
                  placeholder="••••••••"
                  type="password"
                  icon={Lock01}
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
                label="Eslab qolish"
                size="sm"
              />
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-brand-solid hover:text-brand-700 transition-colors outline-none focus-visible:underline"
              >
                Parolni unutdingizmi?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full mt-1"
              size="xl"
              iconLeading={LogIn01}
              isLoading={isLoading}
              isDisabled={isLoading}
            >
              Kirish
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border-secondary" />
            <span className="text-xs font-medium text-tertiary">yoki</span>
            <div className="flex-1 h-px bg-border-secondary" />
          </div>

          {/* ── Social buttons ─────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">

            {/* Google — white bg, colorful Google logo */}
            <SocialButton
              social="google"
              size="md"
              theme="brand"
              className="w-full justify-center"
              disabled={isLoading}
            >
              Google
            </SocialButton>

            {/* Telegram — Telegram blue bg, white icon + text */}
            <button
              type="button"
              disabled={isLoading}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition duration-100 bg-[#0088cc] text-white hover:bg-[#007ab8] active:bg-[#006ba3] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TelegramIcon className="pointer-events-none size-4 shrink-0 text-white" />
              Telegram
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-tertiary">
          Hali ro&apos;yxatdan o&apos;tmaganmisiz?{" "}
          <Link
            href="/signup"
            className="font-semibold text-brand-solid hover:text-brand-700 hover:underline transition-colors"
          >
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </div>
    </div>
  );
}
