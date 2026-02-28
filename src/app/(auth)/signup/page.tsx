"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Mail01,
  Lock01,
  GraduationHat01,
  ArrowRight,
  CheckCircle,
} from "@untitledui/icons";

import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { PinInput } from "@/components/base/pin-input/pin-input";
import { ThemeToggle } from "@/components/base/theme-toggle/theme-toggle";

import {
  useSendOTP,
  useVerifyOTP,
  useSetPassword,
  useResumeSignup,
} from "@/hooks/api/use-auth";
import { useUniversities } from "@/hooks/api/use-university";

// ─── Validation schemas ────────────────────────────────────────────────────
const Step1Schema = z.object({
  email: z.string().email("Yaroqli elektron pochta kiritilmadi"),
});

const Step2Schema = z.object({
  code: z.string().length(6, "Kod 6 xonali bo'lishi shart"),
  name: z.string().min(2, "Ism kamida 2 harfdan iborat bo'lishi kerak"),
  surname: z.string().min(2, "Familiya kamida 2 harfdan iborat bo'lishi kerak"),
  university: z.string().min(1, "Universitetni tanlang"),
});

const Step3Schema = z
  .object({
    password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi shart"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Parollar bir xil emas",
    path: ["confirmPassword"],
  });

type Step1Type = z.infer<typeof Step1Schema>;
type Step2Type = z.infer<typeof Step2Schema>;
type Step3Type = z.infer<typeof Step3Schema>;

type OtpStatus = "idle" | "error" | "success";

const stepLabels = ["Pochta tasdiqlash", "Shaxsiy ma'lumotlar", "Xavfsizlik paroli"];

// ─── Helpers ───────────────────────────────────────────────────────────────
function extractApiError(e: any): string {
  if (!e?.response) {
    // Network / CORS / timeout
    return "Server bilan ulanib bo'lmadi. Internetni tekshiring.";
  }
  const data = e.response.data;
  if (!data) return `Server xatosi (${e.response.status})`;
  if (typeof data === "string") return data;
  // Standard DRF: { detail: "..." }
  if (data.detail) return String(data.detail);
  // Custom: { message: "..." }
  if (data.message) return String(data.message);
  // Field-level errors: { email: ["..."], non_field_errors: ["..."] }
  const fieldMsgs = Object.values(data)
    .flat()
    .filter((v) => typeof v === "string") as string[];
  if (fieldMsgs.length > 0) return fieldMsgs[0];
  return `Xatolik yuz berdi (${e.response.status})`;
}

function getSlotClassName(status: OtpStatus) {
  const base = "aspect-square h-auto !rounded-xl !font-bold !text-lg";
  if (status === "error")
    return `${base} !ring-2 !ring-error-500 !bg-error-50 dark:!bg-error-500/10 dark:!ring-error-400 !text-error-600 dark:!text-error-400`;
  if (status === "success")
    return `${base} !ring-2 !ring-success-500 !bg-success-50 dark:!bg-success-500/10 dark:!ring-success-400 !text-success-700 dark:!text-success-400`;
  // idle – brand tint
  return `${base} !ring-2 !ring-brand-200 dark:!ring-brand-800`;
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [storedEmail, setStoredEmail] = useState("");
  const [otpStatus, setOtpStatus] = useState<OtpStatus>("idle");

  const sendOtp = useSendOTP();
  const verifyOtp = useVerifyOTP();
  const setPassword = useSetPassword();
  const resumeSignup = useResumeSignup();
  const { data: universities, isLoading: isLoadingUniversities } = useUniversities();

  const form1 = useForm<Step1Type>({
    resolver: zodResolver(Step1Schema),
    defaultValues: { email: "" },
  });
  const form2 = useForm<Step2Type>({
    resolver: zodResolver(Step2Schema),
    defaultValues: { code: "", name: "", surname: "", university: "" },
  });
  const form3 = useForm<Step3Type>({
    resolver: zodResolver(Step3Schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // ── Step handlers ─────────────────────────────────────────────────────
  const onStep1Submit = async (data: Step1Type) => {
    try {
      await sendOtp.mutateAsync({ email: data.email });
      setStoredEmail(data.email);
      toast.success("Kod yuborildi", { description: `${data.email} pochtangizni tekshiring.` });
      setStep(2);
    } catch (e: any) {
      const isIncompleteAccount =
        e?.response?.status === 400 &&
        (e.response.data?.error === "incomplete_account" ||
          e.response.data?.code === "incomplete_account");

      if (isIncompleteAccount) {
        try {
          await resumeSignup.mutateAsync({ email: data.email });
          setStoredEmail(data.email);
          toast.success("Tasdiqlanmagan hisob!", {
            description: "Ro'yxatdan o'tishni davom ettirish uchun email yuborildi.",
          });
          setStep(2);
        } catch (re: any) {
          toast.error("Xatolik", { description: extractApiError(re) });
        }
      } else {
        toast.error("Xatolik", { description: extractApiError(e) });
      }
    }
  };

  const onStep2Submit = async (data: Step2Type) => {
    try {
      await verifyOtp.mutateAsync({
        email: storedEmail,
        code: data.code,
        name: data.name,
        surname: data.surname,
        university: data.university,
      });
      setOtpStatus("success");
      toast.success("Ajoyib!", { description: "Kod tasdiqlandi." });
      await new Promise((r) => setTimeout(r, 500));
      setStep(3);
    } catch (e: any) {
      setOtpStatus("error");
      toast.error("Tasdiqlashda xatolik", { description: extractApiError(e) });
    }
  };

  const onStep3Submit = async (data: Step3Type) => {
    try {
      await setPassword.mutateAsync({ password: data.password });
      setStep(4);
    } catch (e: any) {
      toast.error("Xatolik", { description: extractApiError(e) });
    }
  };

  const slotCn = getSlotClassName(otpStatus);

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
      <div className="relative z-10 w-full max-w-[440px]">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-7">
          <Link
            href="/"
            className="flex items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Image src="/icon.svg" alt="Univibe" width={56} height={56} priority />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Ro&apos;yxatdan o&apos;tish
            </h1>
            <p className="mt-1 text-sm text-tertiary">
              Univibe platformasida hisobingizni yarating
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {step < 4 && (
          <div className="mb-5">
            <div className="flex gap-1.5 mb-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    step >= s ? "bg-brand-solid" : "bg-border-secondary"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-medium text-tertiary">
              Qadam {step} / 3 — {stepLabels[step - 1]}
            </p>
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-7">
          <AnimatePresence mode="wait">

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-5 space-y-1">
                  <h2 className="text-base font-semibold text-primary">
                    Elektron pochtangizni kiriting
                  </h2>
                </div>
                <form onSubmit={form1.handleSubmit(onStep1Submit)} className="flex flex-col gap-4">
                  <Controller
                    name="email"
                    control={form1.control}
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        label="Elektron pochta"
                        placeholder="student@univibe.uz"
                        type="email"
                        icon={Mail01}
                        isInvalid={!!fieldState.error}
                        hint={fieldState.error?.message}
                        isDisabled={sendOtp.isPending || resumeSignup.isPending}
                      />
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    size="xl"
                    iconTrailing={ArrowRight}
                    isLoading={sendOtp.isPending || resumeSignup.isPending}
                    isDisabled={sendOtp.isPending || resumeSignup.isPending}
                  >
                    Kodni olish
                  </Button>
                </form>
                <p className="mt-5 text-center text-sm text-tertiary">
                  Allaqachon hisobingiz bormi?{" "}
                  <Link href="/login" className="font-semibold text-brand-solid hover:text-brand-700 hover:underline transition-colors">
                    Kirish
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-5 space-y-1">
                  <h2 className="text-base font-semibold text-primary">
                    Kodni tasdiqlang
                  </h2>
                  <p className="text-sm text-tertiary">
                    <span className="font-semibold text-brand-solid">{storedEmail}</span>{" "}
                    pochtasiga tasdiqlash kodi yuborildi.
                  </p>
                </div>

                <form onSubmit={form2.handleSubmit(onStep2Submit)} className="flex flex-col gap-4">

                  {/* ─── OTP Input ─────────────────────────────── */}
                  <Controller
                    name="code"
                    control={form2.control}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-secondary">
                          Tasdiqlash kodi
                        </label>
                        <PinInput
                          size="md"
                          disabled={verifyOtp.isPending}
                        >
                          <PinInput.Group
                            maxLength={6}
                            value={field.value}
                            onChange={(val) => {
                              field.onChange(val);
                              if (otpStatus !== "idle") setOtpStatus("idle");
                            }}
                            containerClassName="w-full justify-between mt-0.5"
                          >
                            <PinInput.Slot index={0} className={slotCn} />
                            <PinInput.Slot index={1} className={slotCn} />
                            <PinInput.Slot index={2} className={slotCn} />
                            <PinInput.Separator />
                            <PinInput.Slot index={3} className={slotCn} />
                            <PinInput.Slot index={4} className={slotCn} />
                            <PinInput.Slot index={5} className={slotCn} />
                          </PinInput.Group>
                        </PinInput>

                        {/* Status hint */}
                        {otpStatus === "error" || fieldState.error ? (
                          <p className="flex items-center gap-1.5 text-xs font-medium text-error-600 dark:text-error-400 mt-0.5">
                            <span className="size-1.5 rounded-full bg-error-500 shrink-0" />
                            {fieldState.error?.message ?? "Noto'g'ri tasdiqlash kodi kiritildi."}
                          </p>
                        ) : otpStatus === "success" ? (
                          <p className="flex items-center gap-1.5 text-xs font-medium text-success-600 dark:text-success-400 mt-0.5">
                            <span className="size-1.5 rounded-full bg-success-500 shrink-0" />
                            Kod muvaffaqiyatli tasdiqlandi.
                          </p>
                        ) : (
                          <p className="text-xs text-tertiary mt-0.5">
                            Pochtangizga yuborilgan 6 xonali kodni kiriting.
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <Controller
                    name="university"
                    control={form2.control}
                    render={({ field, fieldState }) => (
                      <Select
                        label="Universitet"
                        placeholder="Universitetni tanlang..."
                        placeholderIcon={GraduationHat01}
                        selectedKey={field.value || null}
                        onSelectionChange={(k) => field.onChange(String(k))}
                        isInvalid={!!fieldState.error}
                        hint={fieldState.error?.message}
                        isDisabled={verifyOtp.isPending || isLoadingUniversities}
                        items={universities?.map((u) => ({ id: u.public_id, label: u.name })) || []}
                      >
                        {(item) => (
                          <Select.Item id={item.id} textValue={item.label} label={item.label} />
                        )}
                      </Select>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Controller
                      name="name"
                      control={form2.control}
                      render={({ field, fieldState }) => (
                        <Input
                          {...field}
                          label="Ism"
                          placeholder="Alisher"
                          isInvalid={!!fieldState.error}
                          hint={fieldState.error?.message}
                          isDisabled={verifyOtp.isPending}
                        />
                      )}
                    />
                    <Controller
                      name="surname"
                      control={form2.control}
                      render={({ field, fieldState }) => (
                        <Input
                          {...field}
                          label="Familiya"
                          placeholder="Navoiy"
                          isInvalid={!!fieldState.error}
                          hint={fieldState.error?.message}
                          isDisabled={verifyOtp.isPending}
                        />
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="xl"
                    iconTrailing={CheckCircle}
                    isLoading={verifyOtp.isPending}
                    isDisabled={verifyOtp.isPending}
                  >
                    Tasdiqlash
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-5 space-y-1">
                  <h2 className="text-base font-semibold text-primary">
                    Parolni o&apos;rnating
                  </h2>
                  <p className="text-sm text-tertiary">
                    Akkountingiz tasdiqlandi. Xavfsiz parol belgilang.
                  </p>
                </div>
                <form onSubmit={form3.handleSubmit(onStep3Submit)} className="flex flex-col gap-4">
                  <Controller
                    name="password"
                    control={form3.control}
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        label="Yangi parol"
                        placeholder="••••••••"
                        type="password"
                        icon={Lock01}
                        isInvalid={!!fieldState.error}
                        hint={fieldState.error?.message}
                        isDisabled={setPassword.isPending}
                      />
                    )}
                  />
                  <Controller
                    name="confirmPassword"
                    control={form3.control}
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        label="Parolni takrorlang"
                        placeholder="••••••••"
                        type="password"
                        icon={Lock01}
                        isInvalid={!!fieldState.error}
                        hint={fieldState.error?.message}
                        isDisabled={setPassword.isPending}
                      />
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    size="xl"
                    iconTrailing={ArrowRight}
                    isLoading={setPassword.isPending}
                    isDisabled={setPassword.isPending}
                  >
                    Tugatish
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 4: SUCCESS ── */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center text-center py-4"
              >
                <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10 border-[8px] border-success-100 dark:border-success-500/20">
                  <CheckCircle className="size-9 text-success-600 dark:text-success-400" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-primary mb-2">
                  Ariza qabul qilindi!
                </h2>
                <p className="text-sm text-tertiary leading-relaxed mb-8 max-w-xs">
                  Ma&apos;lumotlaringiz saqlandi. Universitet xodimlari profilingizni tasdiqlangach, tizimga kirishingiz mumkin.
                </p>
                <Button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full"
                  size="xl"
                >
                  Kirish sahifasiga o&apos;tish
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        {step < 4 && (
          <p className="mt-6 text-center text-sm text-tertiary">
            Allaqachon hisobingiz bormi?{" "}
            <Link href="/login" className="font-semibold text-brand-solid hover:text-brand-700 hover:underline transition-colors">
              Kirish
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
