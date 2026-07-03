"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail01, CheckCircle } from "@untitledui/icons";
import { signIn } from "next-auth/react";

import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { PinInput } from "@/components/base/pin-input/pin-input";
import { AuthShell } from "@/components/auth/auth-shell";
import { useTranslation } from "@/lib/i18n/i18n";

import { useSendOTP, useVerifyOTP } from "@/hooks/api/use-auth";
import { useUniversities } from "@/hooks/api/use-university";

import { SignupFormSchema, OtpSchema } from "./schema";
import type { SignupFormType, OtpType } from "./schema";

// ── Helpers ────────────────────────────────────────────────────────────────
/**
 * Turns a backend/network error into a message in the *active* language.
 * Known cases (invalid/expired OTP, account exists, bad credentials) are mapped
 * to localized i18n keys; anything unknown falls back to the backend's own text.
 */
function localizeApiError(e: any, t: (k: string) => string): string {
  if (!e?.response) return t("auth.errServer");
  const { data, status } = e.response;
  const code: string | undefined = data?.error_code;
  const raw =
    typeof data === "string"
      ? data
      : data?.error || data?.detail || data?.message || "";
  const text = String(raw).toLowerCase();

  if (code === "ACCOUNT_ALREADY_EXISTS" || text.includes("already")) return t("auth.errAccountExists");
  if (text.includes("expired")) return t("auth.errOtpExpired");
  if (text.includes("invalid otp") || text.includes("invalid code")) return t("auth.errOtpInvalid");
  if (status === 401) return t("auth.errInvalidCredentials");

  // Unknown but with a server-provided message → surface it verbatim.
  if (raw) return String(raw);
  if (data && typeof data === "object") {
    const fieldMsgs = Object.values(data).flat().filter((v) => typeof v === "string") as string[];
    if (fieldMsgs.length > 0) return fieldMsgs[0];
  }
  return t("auth.errGeneric");
}

/** Drop keyboard focus so no input keeps its focus ring during a step transition. */
function blurActive() {
  if (typeof document !== "undefined") {
    (document.activeElement as HTMLElement | null)?.blur?.();
  }
}

type OtpStatus = "idle" | "error" | "success";

// ── Page ───────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [step3, setStep3] = useState(false);
  const [savedPassword, setSavedPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [otpStatus, setOtpStatus] = useState<OtpStatus>("idle");
  const [countdown, setCountdown] = useState(0);

  const sendOtp = useSendOTP();
  const verifyOtp = useVerifyOTP();
  const { data: universities, isLoading: isLoadingUniversities } = useUniversities();

  // ── Forms
  const signupForm = useForm<SignupFormType>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: { name: "", surname: "", university: "", email: "", password: "", confirmPassword: "" },
    // Don't programmatically focus the first invalid field on submit — that focus
    // ring flashing across the inputs on button click is exactly what we don't want.
    shouldFocusError: false,
  });

  const otpForm = useForm<OtpType>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { code: "" },
    shouldFocusError: false,
  });

  // ── Session storage persistence
  useEffect(() => {
    const stored = sessionStorage.getItem("signupData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.name) signupForm.setValue("name", parsed.name);
        if (parsed.surname) signupForm.setValue("surname", parsed.surname);
        if (parsed.university) signupForm.setValue("university", parsed.university);
        if (parsed.email) signupForm.setValue("email", parsed.email);
      } catch { }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToSession = useCallback((data: Partial<SignupFormType>) => {
    sessionStorage.setItem("signupData", JSON.stringify({
      name: data.name, surname: data.surname, university: data.university, email: data.email,
    }));
  }, []);

  // ── Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // ── Step 1: Submit form → send OTP
  const onFormSubmit = async (data: SignupFormType) => {
    blurActive();
    saveToSession(data);
    sessionStorage.setItem("signupPassword", data.password);
    try {
      await sendOtp.mutateAsync({ email: data.email });
      toast.success(t("auth.codeSent"), { description: `${data.email} ${t("auth.checkEmail")}` });
      setStep(2);
      setCountdown(120);
    } catch (e: any) {
      toast.error(t("common.error"), { description: localizeApiError(e, t) });
    }
  };

  // ── Step 2: Verify OTP
  const onOtpSubmit = async (data: OtpType) => {
    const formData = signupForm.getValues();
    const password = sessionStorage.getItem("signupPassword") || formData.password;
    if (!formData.email || !formData.name || !formData.surname || !formData.university || !password) {
      toast.error(t("common.error"));
      setStep(1);
      return;
    }
    try {
      await verifyOtp.mutateAsync({
        email: formData.email, code: data.code, name: formData.name,
        surname: formData.surname, university: formData.university, password,
      });
      setOtpStatus("success");
      setSavedPassword(password);
      sessionStorage.removeItem("signupData");
      sessionStorage.removeItem("signupPassword");
      blurActive();
      await new Promise((r) => setTimeout(r, 400));
      setStep3(true);
    } catch (e: any) {
      setOtpStatus("error");
      const msg = localizeApiError(e, t);
      otpForm.setError("code", { message: msg });
      toast.error(t("common.error"), { description: msg });
    }
  };

  // ── Step 3: Login after signup
  const handleLoginAfterSignup = async () => {
    setIsLoggingIn(true);
    const email = signupForm.getValues("email");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://test.univibe.uz";
      const res = await fetch(`${baseUrl}/api/v1/user/auth/login/`, {
        method: "POST",
        body: JSON.stringify({ email, password: savedPassword }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(t("auth.errLoginFailed"));
      const data = await res.json();
      const { student_status, access_token, refresh_token, full_name, role, university_id } = data;
      if (student_status) {
        localStorage.setItem("univibe-student-status", student_status);
      }
      await signIn("credentials", {
        redirect: false,
        access_token,
        refresh_token,
        email,
        full_name: full_name || "",
        role: role || "STUDENT",
        university_id: university_id || "",
        student_status: student_status || "",
      });
      // Middleware will redirect to the correct page based on student_status in the JWT
      router.push("/");
    } catch (e: any) {
      toast.error(t("common.error"), { description: e.message || t("auth.errLoginFailed") });
      setIsLoggingIn(false);
    }
  };

  // ── Resend OTP
  const handleResend = async () => {
    const email = signupForm.getValues("email");
    if (!email) return;
    try {
      await sendOtp.mutateAsync({ email });
      setCountdown(120);
      setOtpStatus("idle");
      otpForm.reset();
      toast.success(t("auth.codeSent"));
    } catch (e: any) {
      toast.error(t("common.error"), { description: localizeApiError(e, t) });
    }
  };

  const universityItems = (universities || []).map((u) => ({ id: u.public_id, label: u.name }));

  const isOtpStep = step === 2 && !step3;
  const heading = step3 ? t("auth.signupDoneTitle") : t("auth.signup");
  const subheading = step3
    ? t("auth.signupDoneSubtitle")
    : step === 1
      ? t("auth.signupSubtitle")
      : `${signupForm.getValues("email")} ${t("auth.otpSent")}`;

  return (
    <AuthShell
      illustration={isOtpStep ? "/svgs/otp.svg" : "/svgs/sign-up.svg"}
      illustrationTitle={isOtpStep ? t("auth.otpIllustrationTitle") : t("auth.signupIllustrationTitle")}
      illustrationSubtitle={isOtpStep ? t("auth.otpIllustrationSubtitle") : t("auth.signupIllustrationSubtitle")}
      heading={heading}
      subheading={subheading}
      contentMaxWidth="560px"
    >
        {/* Progress */}
        {!step3 && (
          <div className="mb-5">
            <div className="flex gap-1.5 mb-2">
              {[1, 2].map((s) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-brand-solid" : "bg-border-secondary"}`} />
              ))}
            </div>
            <p className="text-xs font-medium text-tertiary">
              {t("auth.step")} {step} / 2 — {step === 1 ? t("auth.stepInfo") : t("auth.stepVerify")}
            </p>
          </div>
        )}

        {/* Card — `layout` resizes the height smoothly between steps. Children use
            `layout="position"` (NOT full layout) so the inputs never get scale-distorted
            — that distortion is what made a stray "focus border" flash on the inputs. */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
          style={{ borderRadius: 16 }}
          className="overflow-hidden bg-bg-secondary border border-border-secondary shadow-sm p-5 sm:p-7"
        >
          <AnimatePresence mode="popLayout" initial={false}>

            {/* ── STEP 3: Success ── */}
            {step3 && (
              <motion.div key="step3" layout="position" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
                <div className="flex flex-col items-center gap-5 py-4">
                  <div className="flex size-16 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10 border-[6px] border-success-100 dark:border-success-500/20">
                    <CheckCircle className="size-8 text-success-600 dark:text-success-400" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-lg font-bold text-primary mb-1">{t("auth.otpSuccessTitle")}</h2>
                    <p className="text-sm text-tertiary max-w-xs">
                      {t("auth.otpSuccessDesc")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    size="xl"
                    isLoading={isLoggingIn}
                    isDisabled={isLoggingIn}
                    onClick={handleLoginAfterSignup}
                  >
                    {t("auth.otpSuccessButton")}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && !step3 && (
              <motion.div key="step1" layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: "easeOut" }}>
                <form onSubmit={signupForm.handleSubmit(onFormSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-1">
                    <Controller name="name" control={signupForm.control} render={({ field }) => (
                      <Input {...field} label={t("auth.name")} placeholder={t("auth.namePlaceholder")} isInvalid={!!signupForm.formState.errors.name} hint={signupForm.formState.errors.name?.message} isDisabled={sendOtp.isPending} />
                    )} />
                  </div>
                  <div className="sm:col-span-1">
                    <Controller name="surname" control={signupForm.control} render={({ field }) => (
                      <Input {...field} label={t("auth.surname")} placeholder={t("auth.surnamePlaceholder")} isInvalid={!!signupForm.formState.errors.surname} hint={signupForm.formState.errors.surname?.message} isDisabled={sendOtp.isPending} />
                    )} />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <Controller name="university" control={signupForm.control} render={({ field }) => (
                      <Select label={t("auth.university")} placeholder={t("auth.universityPlaceholder")} items={universityItems} selectedKey={field.value || null} onSelectionChange={(key) => field.onChange(String(key))} isDisabled={isLoadingUniversities || sendOtp.isPending} isInvalid={!!signupForm.formState.errors.university} hint={signupForm.formState.errors.university?.message}>
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                      </Select>
                    )} />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <Controller name="email" control={signupForm.control} render={({ field }) => (
                      <Input {...field} label={t("auth.email")} placeholder={t("auth.emailPlaceholder")} type="email" isInvalid={!!signupForm.formState.errors.email} hint={signupForm.formState.errors.email?.message} isDisabled={sendOtp.isPending} />
                    )} />
                  </div>
                  <div className="sm:col-span-1">
                    <Controller name="password" control={signupForm.control} render={({ field }) => (
                      <Input {...field} label={t("auth.password")} placeholder={t("auth.passwordMin")} type="password" isInvalid={!!signupForm.formState.errors.password} hint={signupForm.formState.errors.password?.message} isDisabled={sendOtp.isPending} />
                    )} />
                  </div>
                  <div className="sm:col-span-1">
                    <Controller name="confirmPassword" control={signupForm.control} render={({ field }) => (
                      <Input {...field} label={t("auth.confirmPassword")} placeholder={t("auth.confirmPasswordPlaceholder")} type="password" isInvalid={!!signupForm.formState.errors.confirmPassword} hint={signupForm.formState.errors.confirmPassword?.message} isDisabled={sendOtp.isPending} />
                    )} />
                  </div>
                  <div className="col-span-1 sm:col-span-2 mt-2">
                    <Button type="submit" className="w-full" size="xl" isLoading={sendOtp.isPending} isDisabled={sendOtp.isPending}>
                      {t("auth.continue")}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 2 && !step3 && (
              <motion.div key="step2" layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: "easeOut" }}>
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="flex flex-col items-center gap-5">
                  <div className="flex size-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10 border-[6px] border-brand-100 dark:border-brand-500/20">
                    <Mail01 className="size-6 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-lg font-bold text-primary mb-1">{t("auth.otpTitle")}</h2>
                    <p className="text-sm text-tertiary">
                      <strong className="text-secondary">{signupForm.getValues("email")}</strong> {t("auth.otpSent")}
                    </p>
                  </div>
                  <Controller name="code" control={otpForm.control} render={({ field }) => (
                    <PinInput size="sm">
                      <PinInput.Group maxLength={6} value={field.value} onChange={(val: string) => { field.onChange(val); if (otpStatus !== "idle") setOtpStatus("idle"); }} onComplete={() => otpForm.handleSubmit(onOtpSubmit)()}>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <PinInput.Slot key={i} index={i} className={otpStatus === "error" ? "!ring-2 !ring-error-500 !bg-error-50 dark:!bg-error-500/10 dark:!ring-error-400" : otpStatus === "success" ? "!ring-2 !ring-success-500 !bg-success-50 dark:!bg-success-500/10 dark:!ring-success-400" : ""} />
                        ))}
                      </PinInput.Group>
                    </PinInput>
                  )} />
                  {otpForm.formState.errors.code && <p className="text-sm text-error-600 dark:text-error-400">{otpForm.formState.errors.code.message}</p>}
                  <Button type="submit" className="w-full" size="xl" isLoading={verifyOtp.isPending} isDisabled={verifyOtp.isPending}>
                    {t("auth.otpVerify")}
                  </Button>
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-sm text-tertiary">{t("auth.otpResendIn")} <span className="font-semibold text-secondary">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}</span></p>
                    ) : (
                      <button type="button" onClick={handleResend} disabled={sendOtp.isPending} className="text-sm font-semibold text-brand-solid hover:text-brand-700 transition-colors disabled:opacity-50">
                        {t("auth.otpResend")}
                      </button>
                    )}
                  </div>
                  <button type="button" onClick={() => { blurActive(); setStep(1); setOtpStatus("idle"); otpForm.reset(); }} className="inline-flex items-center gap-1.5 text-sm font-medium text-tertiary hover:text-secondary transition-colors">
                    <ArrowLeft className="size-4" />
                    {t("auth.otpBack")}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        {step === 1 && !step3 && (
          <p className="mt-6 text-center text-sm text-tertiary">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="font-semibold text-brand-solid hover:text-brand-700 hover:underline transition-colors">{t("auth.loginLink")}</Link>
          </p>
        )}
    </AuthShell>
  );
}
