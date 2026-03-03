"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CheckCircle, Clock, LogOut01 } from "@untitledui/icons";

import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { parseDate } from "@internationalized/date";
import { useTranslation } from "@/lib/i18n/i18n";

import { useStudentMe, useFaculties, useDegreeLevels, useYearLevels, useUpdateProfile } from "@/hooks/api/use-profile";

const ProfileSchema = z.object({
  name: z.string().min(1, "Ismni kiriting"),
  surname: z.string().min(1, "Familiyani kiriting"),
  profile_photo: z.any().optional(),
  middle_name: z.string().optional(),
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
  const { data: session, status: authStatus, update: updateSession } = useSession();
  const { data: me, isLoading: isLoadingMe } = useStudentMe();
  const updateProfile = useUpdateProfile();
  const [success, setSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  // If the session is stale (admin approved/rejected the student after login),
  // update the JWT so middleware allows the redirect on next navigation.
  useEffect(() => {
    if (!me) return;
    if (me.status === "approved" || me.status === "rejected") {
      const sessionStatus = session?.user?.studentStatus;
      if (sessionStatus !== me.status) {
        updateSession({ studentStatus: me.status }).then(() => router.push("/"));
      } else {
        router.push("/");
      }
    }
  }, [me]); // eslint-disable-line react-hooks/exhaustive-deps

  const universityId = me?.university_public_id || (me?.university_id ? String(me.university_id) : undefined);
  const { data: faculties, isLoading: isLoadingFaculties } = useFaculties(universityId);
  const { data: degreeLevels, isLoading: isLoadingDegrees } = useDegreeLevels(universityId);
  const { data: yearLevels, isLoading: isLoadingYears } = useYearLevels(universityId);

  const form = useForm<ProfileFormType>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: "",
      surname: "",
      profile_photo: undefined,
      middle_name: "",
      date_of_birth: "",
      contact_phone_number: "",
      faculty_id: "",
      degree_level_id: "",
      year_level_id: ""
    },
  });

  // Pre-fill name/surname: from me data (API) first, then fallback to session full_name
  // for not_found users where /student/me returns 404 and me is undefined
  useEffect(() => {
    const currentName = form.getValues("name");
    const currentSurname = form.getValues("surname");
    if (me?.name && !currentName) form.setValue("name", me.name);
    if (me?.surname && !currentSurname) form.setValue("surname", me.surname);
    if (!me) {
      const parts = (session?.user?.name || "").trim().split(/\s+/);
      if (!currentName && parts[0]) form.setValue("name", parts[0]);
      if (!currentSurname && parts[1]) form.setValue("surname", parts.slice(1).join(" "));
    }
  }, [me, session?.user?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: ProfileFormType) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("surname", data.surname.trim());
      if (data.profile_photo instanceof File) {
        formData.append("profile_photo", data.profile_photo);
      }
      if (data.middle_name) formData.append("middle_name", data.middle_name);
      formData.append("date_of_birth", data.date_of_birth);
      formData.append("contact_phone_number", data.contact_phone_number);
      formData.append("faculty_id", data.faculty_id);
      formData.append("degree_level_id", data.degree_level_id);
      formData.append("year_level_id", data.year_level_id);
      await updateProfile.mutateAsync(formData);
      // Status is now "waited" on the backend — update session so middleware
      // knows the correct status before any next navigation.
      await updateSession({ studentStatus: "waited" });
      setSuccess(true);
      toast.success(t("common.success"));
    } catch (e: any) {
      const errData = e?.response?.data;
      const msg = errData?.detail || errData?.message || errData || t("common.error");
      toast.error(t("common.error"), { description: typeof msg === "string" ? msg : JSON.stringify(msg, null, 2) });
    }
  };

  const handleSignOut = () => {
    try { localStorage.removeItem("univibe-student-status"); } catch { }
    try { localStorage.removeItem("univibe-profile"); } catch { }
    try { localStorage.removeItem("user-storage"); } catch { }
    try { localStorage.removeItem("user-profile-storage"); } catch { }
    try { sessionStorage.clear(); } catch { }
    signOut({ callbackUrl: `${window.location.origin}/login` });
  };

  const facultyItems = (faculties || []).map((f) => ({ id: f.public_id, label: f.name }));
  const degreeItems = (degreeLevels || []).map((d) => ({ id: d.public_id, label: d.name }));
  const yearItems = (yearLevels || []).map((y) => ({ id: y.public_id, label: y.name }));

  if (authStatus === "loading" || isLoadingMe) {
    return (
      <div className="flex flex-col gap-6 w-full animate-pulse-fast">
        <div className="h-40 sm:h-48 w-full rounded-2xl bg-bg-secondary border border-border-secondary skeleton-shimmer" />
        <div className="rounded-2xl bg-bg-secondary border border-border-secondary p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div className="h-12 rounded-xl skeleton-shimmer" />
            <div className="h-12 rounded-xl skeleton-shimmer" />
            <div className="sm:col-span-2 h-12 rounded-xl skeleton-shimmer" />
            <div className="h-12 rounded-xl skeleton-shimmer" />
            <div className="h-12 rounded-xl skeleton-shimmer" />
          </div>
          <div className="h-12 w-32 rounded-xl skeleton-shimmer mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Premium Header */}
      <div className="relative pt-10 pb-12 px-6 sm:px-10 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 overflow-hidden shadow-sm rounded-2xl mt-2 border border-brand-800/50">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none select-none">
          <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_100%,rgba(255,255,255,0.04)_0%,transparent_50%)] pointer-events-none select-none" />

        <div className="relative z-10 flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm w-fit mb-2">
            <div className="size-2 rounded-full bg-warning-400 animate-pulse" />
            <span className="text-xs font-semibold text-white tracking-wide uppercase">
              {t("profile.statusWaited")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {t("personalInfo.title")}
          </h1>
          <p className="text-brand-100/90 text-sm sm:text-base max-w-xl">
            {t("personalInfo.subtitle")}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-5 sm:p-7">
        {success ? (
          <div className="flex flex-col items-center text-center py-10">
            <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10 border-[8px] border-success-100 dark:border-success-500/20">
              <CheckCircle className="size-12 text-success-600 dark:text-success-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-3">{t("personalInfo.successTitle")}</h2>
            <p className="text-sm sm:text-base text-tertiary leading-relaxed max-w-md">
              {t("personalInfo.successDesc")}
            </p>
          </div>
        ) : me?.status === "waited" && !updateProfile.isPending ? (
          <div className="flex flex-col items-center text-center py-10">
            <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10 border-[8px] border-brand-100 dark:border-brand-500/20">
              <Clock className="size-12 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-3">{t("waiting.title")}</h2>
            <p className="text-sm sm:text-base text-tertiary leading-relaxed max-w-md">
              {t("waiting.description")}
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* Name row */}
            <div className="sm:col-span-1">
              <Controller name="name" control={form.control} render={({ field }) => (
                <Input {...field} label={`${t("auth.name")} *`} placeholder="Alisher" isInvalid={!!form.formState.errors.name} hint={form.formState.errors.name?.message} isDisabled={updateProfile.isPending} />
              )} />
            </div>
            <div className="sm:col-span-1">
              <Controller name="surname" control={form.control} render={({ field }) => (
                <Input {...field} label={`${t("auth.surname")} *`} placeholder="Toshmatov" isInvalid={!!form.formState.errors.surname} hint={form.formState.errors.surname?.message} isDisabled={updateProfile.isPending} />
              )} />
            </div>

            {/* Profile photo */}
            <div className="col-span-1 sm:col-span-2">
              <Controller name="profile_photo" control={form.control} render={({ field: { onChange } }) => (
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-sm font-medium text-fg-secondary">{t("personalInfo.photoLabel")}</label>
                  <FileUpload.Root accept="image/*" maxFiles={1}>
                    <FileUpload.DropZone
                      accept="image/*"
                      hint="Iltimos faqat rasm (PNG, JPEG) yuklang"
                      onDropFiles={(files) => {
                        const newFiles = Array.from(files);
                        if (newFiles.length > 0) {
                          const file = newFiles[0];
                          onChange(file);
                          setUploadedFiles([{
                            id: Math.random().toString(),
                            name: file.name,
                            size: file.size,
                            progress: 100
                          }]);
                        }
                      }}
                    />
                    {uploadedFiles.length > 0 && (
                      <FileUpload.List>
                        {uploadedFiles.map((file) => (
                          <FileUpload.ListItemProgressBar
                            key={file.id}
                            name={file.name}
                            size={file.size}
                            progress={file.progress}
                            onDelete={() => {
                              onChange(undefined);
                              setUploadedFiles([]);
                            }}
                          />
                        ))}
                      </FileUpload.List>
                    )}
                  </FileUpload.Root>
                  {form.formState.errors.profile_photo && (
                    <p className="text-xs text-error-600">{form.formState.errors.profile_photo.message as string}</p>
                  )}
                </div>
              )} />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <Controller name="middle_name" control={form.control} render={({ field }) => (
                <Input {...field} label={t("profile.middleName") || "Sharifingiz"} placeholder="Sharifingizni kiriting" isInvalid={!!form.formState.errors.middle_name} hint={form.formState.errors.middle_name?.message} isDisabled={updateProfile.isPending} />
              )} />
            </div>
            <div className="sm:col-span-1">
              <Controller name="date_of_birth" control={form.control} render={({ field }) => (
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-sm font-medium text-fg-secondary">{t("personalInfo.dob")}</label>
                  <DatePicker
                    value={field.value ? parseDate(field.value) : null}
                    onChange={(v) => field.onChange(v ? v.toString() : "")}
                  />
                  {form.formState.errors.date_of_birth && (
                    <p className="text-xs text-error-600">{form.formState.errors.date_of_birth.message}</p>
                  )}
                </div>
              )} />
            </div>
            <div className="sm:col-span-1">
              <Controller name="contact_phone_number" control={form.control} render={({ field }) => (
                <Input {...field} label={t("personalInfo.phone")} placeholder={t("personalInfo.phonePlaceholder")} type="tel" isInvalid={!!form.formState.errors.contact_phone_number} hint={form.formState.errors.contact_phone_number?.message} isDisabled={updateProfile.isPending} />
              )} />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <Controller name="faculty_id" control={form.control} render={({ field }) => (
                <Select label={t("personalInfo.faculty")} placeholder={t("personalInfo.facultyPlaceholder")} items={facultyItems} selectedKey={field.value || null} onSelectionChange={(key) => field.onChange(String(key))} isDisabled={isLoadingFaculties || updateProfile.isPending} isInvalid={!!form.formState.errors.faculty_id} hint={form.formState.errors.faculty_id?.message}>
                  {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
              )} />
            </div>
            <div className="sm:col-span-1">
              <Controller name="degree_level_id" control={form.control} render={({ field }) => (
                <Select label={t("personalInfo.degree")} placeholder={t("personalInfo.degreePlaceholder")} items={degreeItems} selectedKey={field.value || null} onSelectionChange={(key) => field.onChange(String(key))} isDisabled={isLoadingDegrees || updateProfile.isPending} isInvalid={!!form.formState.errors.degree_level_id} hint={form.formState.errors.degree_level_id?.message}>
                  {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
              )} />
            </div>
            <div className="sm:col-span-1">
              <Controller name="year_level_id" control={form.control} render={({ field }) => (
                <Select label={t("personalInfo.year")} placeholder={t("personalInfo.yearPlaceholder")} items={yearItems} selectedKey={field.value || null} onSelectionChange={(key) => field.onChange(String(key))} isDisabled={isLoadingYears || updateProfile.isPending} isInvalid={!!form.formState.errors.year_level_id} hint={form.formState.errors.year_level_id?.message}>
                  {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
              )} />
            </div>
            <div className="col-span-1 sm:col-span-2 mt-4 flex justify-end">
              <Button type="submit" size="md" isLoading={updateProfile.isPending} isDisabled={updateProfile.isPending}>
                {t("personalInfo.saveButton")}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Sign out — accessible on all screen sizes when stuck on this page */}
      <div className="flex justify-center pb-2">
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
        >
          <LogOut01 className="size-4" />
          {t("profile.logoutButton") || "Tizimdan chiqish"}
        </button>
      </div>
    </div>
  );
}
