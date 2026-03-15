import * as z from "zod";

export const createForgotPasswordEmailSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t("auth.forgotEmailError")),
});

export type ForgotPasswordEmailType = z.infer<ReturnType<typeof createForgotPasswordEmailSchema>>;

export const createForgotPasswordOtpSchema = (t: (key: string) => string) => z.object({
  code: z.string().length(6, t("auth.forgotCodeError")),
});

export type ForgotPasswordOtpType = z.infer<ReturnType<typeof createForgotPasswordOtpSchema>>;

export const createForgotPasswordSetSchema = (t: (key: string) => string) => z.object({
  password: z.string().min(6, t("auth.forgotPasswordLengthError")),
  confirmPassword: z.string().min(6, t("auth.forgotPasswordLengthError")),
}).refine((data) => data.password === data.confirmPassword, {
  message: t("auth.forgotPasswordError"),
  path: ["confirmPassword"],
});

export type ForgotPasswordSetType = z.infer<ReturnType<typeof createForgotPasswordSetSchema>>;
