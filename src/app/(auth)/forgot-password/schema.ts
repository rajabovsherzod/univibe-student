import * as z from "zod";

export const ForgotPasswordEmailSchema = z.object({
  email: z.string().email("Yaroqli elektron pochta kiriting"),
});

export type ForgotPasswordEmailType = z.infer<typeof ForgotPasswordEmailSchema>;

export const ForgotPasswordOtpSchema = z.object({
  code: z.string().length(6, "Kodni to'liq kiriting"),
});

export type ForgotPasswordOtpType = z.infer<typeof ForgotPasswordOtpSchema>;

export const ForgotPasswordSetSchema = z.object({
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
  confirmPassword: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parollar mos kelmadi",
  path: ["confirmPassword"],
});

export type ForgotPasswordSetType = z.infer<typeof ForgotPasswordSetSchema>;
