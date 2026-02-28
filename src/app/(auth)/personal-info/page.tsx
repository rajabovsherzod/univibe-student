"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowRight, CheckCircle } from "@untitledui/icons";

import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { ThemeToggle } from "@/components/base/theme-toggle/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/i18n";

import { useStudentMe, useFaculties, useDegreeLevels, useYearLevels, useUpdateProfile } from "@/hooks/api/use-profile";

const ProfileSchema = z.object({
  date_of_birth: z.string().min(1, "Tug'ilgan sanani kiriting"),
  contact_phone_number: z.string().min(9, "Telefon raqamini kiriting"),
  faculty_id: z.string().min(1, "Fakultetni tanlang"),
  degree_level_id: z.string().min(1, "Darajani tanlang"),
  year_level_id: z.string().min(1, "Kursni tanlang"),
});

type ProfileFormType = z.infer<typeof ProfileSchema>;

export default function PersonalInfoPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { status: authStatus } = useSession();
  const { data: me } = useStudentMe();
  const updateProfile = useUpdateProfile();
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (authStatus === "unauthenticated") router.push("/login"); }, [authStatus, router]);
  useEffect(() => { if (me?.status) router.push("/"); }, [me, router]);

  const universityId = me?.university_public_id;
  const { data: faculties, isLoading: isLoadingFaculties } = useFaculties(universityId);
  const { data: degreeLevels, isLoading: isLoadingDegrees } = useDegreeLevels(universityId);
  const { data: yearLevels, isLoading: isLoadingYears } = useYearLevels(universityId);

  const form = useForm<ProfileFormType>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: { date_of_birth: "", contact_phone_number: "", faculty_id: "", degree_level_id: "", year_level_id: "" },
  });

  const onSubmit = async (data: ProfileFormType) => {
    try {
      const formData = new FormData();
      formData.append("name", me?.user_name || me?.name || "");
      formData.append("surname", me?.user_surname || me?.surname || "");
      formData.append("date_of_birth", data.date_of_birth);
      formData.append("contact_phone_number", data.contact_phone_number);
      formData.append("faculty_id", data.faculty_id);
      formData.append("degree_level_id", data.degree_level_id);
      formData.append("year_level_id", data.year_level_id);
      await updateProfile.mutateAsync(formData);
      setSuccess(true);
      toast.success(t("common.success"));
      await new Promise((r) => setTimeout(r, 1500));
      router.push("/");
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.response?.data?.message || t("common.error");
      toast.error(t("common.error"), { description: typeof msg === "string" ? msg : "Server xatosi" });
    }
  };

  const facultyItems = (faculties || []).map((f) => ({ id: f.public_id, label: f.name }));
  const degreeItems = (degreeLevels || []).map((d) => ({ id: d.public_id, label: d.name }));
  const yearItems = (yearLevels || []).map((y) => ({ id: y.public_id, label: y.name }));

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

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="flex flex-col items-center gap-3 mb-6">
          <Image src="/icon.svg" alt="Univibe" width={56} height={56} priority />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-primary">{t("personalInfo.title")}</h1>
            <p className="mt-1 text-sm text-tertiary">{t("personalInfo.subtitle")}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-7">
          {success ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10 border-[8px] border-success-100 dark:border-success-500/20">
                <CheckCircle className="size-9 text-success-600 dark:text-success-400" />
              </div>
              <h2 className="text-xl font-bold text-primary mb-2">{t("personalInfo.successTitle")}</h2>
              <p className="text-sm text-tertiary leading-relaxed max-w-xs">{t("personalInfo.successDesc")}</p>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Controller name="date_of_birth" control={form.control} render={({ field }) => (
                <Input {...field} label={t("personalInfo.dob")} type="date" isInvalid={!!form.formState.errors.date_of_birth} hint={form.formState.errors.date_of_birth?.message} isDisabled={updateProfile.isPending} />
              )} />
              <Controller name="contact_phone_number" control={form.control} render={({ field }) => (
                <Input {...field} label={t("personalInfo.phone")} placeholder={t("personalInfo.phonePlaceholder")} type="tel" isInvalid={!!form.formState.errors.contact_phone_number} hint={form.formState.errors.contact_phone_number?.message} isDisabled={updateProfile.isPending} />
              )} />
              <Controller name="faculty_id" control={form.control} render={({ field }) => (
                <Select label={t("personalInfo.faculty")} placeholder={t("personalInfo.facultyPlaceholder")} items={facultyItems} selectedKey={field.value || null} onSelectionChange={(key) => field.onChange(String(key))} isDisabled={isLoadingFaculties || updateProfile.isPending} isInvalid={!!form.formState.errors.faculty_id} hint={form.formState.errors.faculty_id?.message}>
                  {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
              )} />
              <Controller name="degree_level_id" control={form.control} render={({ field }) => (
                <Select label={t("personalInfo.degree")} placeholder={t("personalInfo.degreePlaceholder")} items={degreeItems} selectedKey={field.value || null} onSelectionChange={(key) => field.onChange(String(key))} isDisabled={isLoadingDegrees || updateProfile.isPending} isInvalid={!!form.formState.errors.degree_level_id} hint={form.formState.errors.degree_level_id?.message}>
                  {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
              )} />
              <Controller name="year_level_id" control={form.control} render={({ field }) => (
                <Select label={t("personalInfo.year")} placeholder={t("personalInfo.yearPlaceholder")} items={yearItems} selectedKey={field.value || null} onSelectionChange={(key) => field.onChange(String(key))} isDisabled={isLoadingYears || updateProfile.isPending} isInvalid={!!form.formState.errors.year_level_id} hint={form.formState.errors.year_level_id?.message}>
                  {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
              )} />
              <Button type="submit" className="w-full mt-2" size="xl" iconTrailing={ArrowRight} isLoading={updateProfile.isPending} isDisabled={updateProfile.isPending}>
                {t("personalInfo.saveButton")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
