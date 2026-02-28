import * as z from "zod";

export const SignupFormSchema = z
  .object({
    name: z.string().min(2, "Ism kamida 2 harfdan iborat bo'lishi kerak"),
    surname: z.string().min(2, "Familiya kamida 2 harfdan iborat bo'lishi kerak"),
    university: z.string().min(1, "Universitetni tanlang"),
    email: z.string().email("Yaroqli elektron pochta kiritilmadi"),
    password: z.string().min(8, "Parol kamida 8 belgidan iborat bo'lishi shart"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Parollar bir xil emas",
    path: ["confirmPassword"],
  });

export const OtpSchema = z.object({
  code: z.string().length(6, "Kod 6 xonali bo'lishi shart"),
});

export type SignupFormType = z.infer<typeof SignupFormSchema>;
export type OtpType = z.infer<typeof OtpSchema>;
