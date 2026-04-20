"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parseDate } from "@internationalized/date";
import Image from "next/image";
import { getLogoutUrl } from "@/lib/get-app-url";
import {
  CameraIcon, BuildingsIcon, SignOutIcon, LockIcon, ClockIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "@/lib/i18n/i18n";

import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { DatePicker } from "@/components/application/date-picker/date-picker";

import {
  useStudentMe,
  useFaculties,
  useDegreeLevels,
  useYearLevels,
  useUpdateProfile,
} from "@/hooks/api/use-profile";
import { toHttps } from "@/utils/cx";

type ProfileFormType = {
  name: string;
  surname: string;
  middle_name: string;
  university_student_id: string;
  date_of_birth: string;
  contact_phone_number: string;
  faculty_id: string;
  degree_level_id: string;
  year_level_id: string;
};

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-secondary bg-bg-secondary shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border-secondary">
        <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SetupProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, status: authStatus, update: updateSession } = useSession();
  const { data: me, isLoading: isLoadingMe } = useStudentMe();
  const updateProfile = useUpdateProfile();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Already approved/rejected → go home
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

  const universityId =
    me?.university_public_id ||
    (me?.university_id ? String(me.university_id) : undefined);

  const { data: faculties,    isLoading: isLoadingFaculties } = useFaculties(universityId);
  const { data: degreeLevels, isLoading: isLoadingDegrees   } = useDegreeLevels(universityId);
  const { data: yearLevels,   isLoading: isLoadingYears     } = useYearLevels(universityId);

  // Schema defined inside component to use current language for validation messages
  const profileSchema = z.object({
    name:                   z.string().min(1, t("validation.name")),
    surname:                z.string().min(1, t("validation.surname")),
    middle_name:            z.string().min(1, t("validation.middleName")),
    university_student_id:  z.string().min(1, t("validation.studentId")),
    date_of_birth:          z.string().min(1, t("validation.dob")),
    contact_phone_number:   z.string().min(9, t("validation.phone")),
    faculty_id:             z.string().min(1, t("validation.faculty")),
    degree_level_id:        z.string().min(1, t("validation.degree")),
    year_level_id:          z.string().min(1, t("validation.year")),
  });

  const { control, handleSubmit, formState, setValue, getValues } = useForm<ProfileFormType>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "", surname: "", middle_name: "", university_student_id: "",
      date_of_birth: "", contact_phone_number: "",
      faculty_id: "", degree_level_id: "", year_level_id: "",
    },
  });

  // Pre-fill name/surname from profile or session
  useEffect(() => {
    const v = getValues();
    if (me?.name    && !v.name)    setValue("name",    me.name);
    if (me?.surname && !v.surname) setValue("surname", me.surname);
    if (!me) {
      const parts = (session?.user?.name || "").trim().split(/\s+/);
      if (!v.name    && parts[0]) setValue("name",    parts[0]);
      if (!v.surname && parts[1]) setValue("surname", parts.slice(1).join(" "));
    }
  }, [me, session?.user?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (data: ProfileFormType) => {
    try {
      const fd = new FormData();
      fd.append("name",                   data.name.trim());
      fd.append("surname",                data.surname.trim());
      fd.append("middle_name",            data.middle_name.trim());
      fd.append("university_student_id",  data.university_student_id.trim());
      fd.append("date_of_birth",          data.date_of_birth);
      fd.append("contact_phone_number",   data.contact_phone_number);
      fd.append("faculty_id",             data.faculty_id);
      fd.append("degree_level_id",        data.degree_level_id);
      fd.append("year_level_id",          data.year_level_id);
      if (photoFile) fd.append("profile_photo", photoFile);

      await updateProfile.mutateAsync(fd);
      await updateSession({ studentStatus: "waited" });
      router.push("/waiting-room");
    } catch (error: unknown) {
      const err = error as { response?: { data?: Record<string, unknown> | string } };
      const errData = err?.response?.data;
      const msg =
        (errData && typeof errData === "object" && (
          ("detail"  in errData ? errData.detail  : undefined) ||
          ("message" in errData ? errData.message : undefined)
        )) || errData || t("setup.saveError");
      const { toast } = await import("sonner");
      toast.error(t("common.error"), {
        description: typeof msg === "string" ? msg : JSON.stringify(msg, null, 2),
      });
    }
  };

  const handleSignOut = () => {
    try { localStorage.removeItem("univibe-profile"); } catch { }
    try { localStorage.removeItem("user-storage"); } catch { }
    try { localStorage.removeItem("user-profile-storage"); } catch { }
    try { sessionStorage.clear(); } catch { }
    signOut({ callbackUrl: getLogoutUrl() });
  };

  const isSubmitting = updateProfile.isPending;

  // Display values for the hero card
  const displayName = me?.name || me?.surname
    ? `${me?.name || ""} ${me?.surname || ""}`.trim()
    : (session?.user?.name || "").replace(/\bUser\b/gi, "").trim() || "Talaba";
  const displayEmail = me?.email || session?.user?.email;
  const universityName = me?.university_name;
  const avatarSrc = photoPreview || toHttps(me?.profile_photo_url);
  const initial = displayName.charAt(0).toUpperCase();

  const facultyItems    = (faculties    || []).map(f => ({ id: f.public_id, label: f.name }));
  const degreeItems     = (degreeLevels || []).map(d => ({ id: d.public_id, label: d.name }));
  const yearItems       = (yearLevels   || []).map(y => ({ id: y.public_id, label: y.name }));

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (authStatus === "loading" || isLoadingMe) {
    return (
      <div className="space-y-4 pb-10 animate-pulse">
        <div className="h-12 rounded-2xl bg-bg-secondary border border-border-secondary" />
        <div className="rounded-2xl border border-border-secondary overflow-hidden">
          <div className="h-36 bg-brand-600/30" />
        </div>
        <div className="rounded-2xl border border-border-secondary bg-bg-secondary p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-11 rounded-lg skeleton-shimmer" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border-secondary bg-bg-secondary p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 rounded-lg skeleton-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-10">

      {/* ── Status banner ── */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-border-secondary bg-bg-secondary shadow-xs px-4 py-3.5">
        <div className="size-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 ring-1 ring-brand-200/60 dark:ring-brand-500/25 flex items-center justify-center shrink-0">
          <ClockIcon size={17} weight="fill" className="text-brand-600 dark:text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-fg-primary">{t("setup.bannerTitle")}</p>
          <p className="text-xs text-fg-tertiary leading-relaxed mt-0.5">
            {t("setup.bannerDesc")}
          </p>
        </div>
        <div className="shrink-0 hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-brand-500 dark:bg-brand-500 text-white dark:text-warning-300 ring-1 ring-warning-200 dark:ring-warning-500/25">
          <span className="size-1.5 rounded-full bg-white animate-pulse" />
          {t("setup.bannerBadge")}
        </div>
      </div>

      {/* ── Hero card ── */}
      <div className="rounded-2xl border border-border-secondary bg-bg-secondary shadow-sm overflow-hidden">
        <div className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 px-5 sm:px-6 py-6 sm:py-8">
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px),radial-gradient(circle_at_70%_80%,white_1px,transparent_1px)] bg-[length:24px_24px]" />

          <div className="relative z-10 flex flex-col items-center sm:flex-row sm:items-center gap-4 sm:gap-5">
            {/* Clickable avatar */}
            <div className="relative shrink-0">
              <div className="size-20 sm:size-24 rounded-2xl overflow-hidden bg-white/20 ring-[3px] ring-white/30">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={displayName}
                    width={96}
                    height={96}
                    className="size-full object-cover"
                    unoptimized={!!photoPreview}
                  />
                ) : (
                  <div className="size-full flex items-center justify-center text-white font-bold text-3xl select-none">
                    {initial}
                  </div>
                )}
              </div>
              {/* Camera overlay */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <CameraIcon size={22} weight="fill" className="text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
            </div>

            {/* Name + info */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">
                {displayName}
              </h1>
              <div className="mt-1.5 space-y-0.5">
                {displayEmail && (
                  <p className="text-sm text-white/70">{displayEmail}</p>
                )}
                {universityName && (
                  <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-white/80">
                    <BuildingsIcon size={14} className="text-white/60 shrink-0" />
                    {universityName}
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs text-white/50 italic">
                {t("setup.avatarHint")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Shaxsiy ma'lumotlar ── */}
      <Section title={t("profile.personalInfoSection")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
          <Controller name="name" control={control}
            render={({ field }) => (
              <Input {...field} label={`${t("auth.name")} *`} placeholder="Alisher"
                isInvalid={!!formState.errors.name}
                hint={formState.errors.name?.message}
                isDisabled={isSubmitting} />
            )}
          />
          <Controller name="surname" control={control}
            render={({ field }) => (
              <Input {...field} label={`${t("auth.surname")} *`} placeholder="Toshmatov"
                isInvalid={!!formState.errors.surname}
                hint={formState.errors.surname?.message}
                isDisabled={isSubmitting} />
            )}
          />
          <Controller name="middle_name" control={control}
            render={({ field }) => (
              <Input {...field} label={`${t("profile.middleName")} *`} placeholder="Baxtiyorovich"
                isInvalid={!!formState.errors.middle_name}
                hint={formState.errors.middle_name?.message}
                isDisabled={isSubmitting} />
            )}
          />
          <Controller name="contact_phone_number" control={control}
            render={({ field }) => (
              <Input {...field} label={`${t("personalInfo.phone")} *`} placeholder="+998901234567" type="tel"
                isInvalid={!!formState.errors.contact_phone_number}
                hint={formState.errors.contact_phone_number?.message}
                isDisabled={isSubmitting} />
            )}
          />
          <Controller name="date_of_birth" control={control}
            render={({ field }) => (
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-sm font-medium text-fg-primary">
                  {t("personalInfo.dob")} *
                </label>
                <DatePicker
                  value={field.value ? parseDate(field.value) : null}
                  onChange={(v) => field.onChange(v ? v.toString() : "")}
                />
                {formState.errors.date_of_birth && (
                  <p className="text-xs text-error-600">{formState.errors.date_of_birth.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </Section>

      {/* ── Akademik ma'lumotlar ── */}
      <Section title={t("profile.academicSection")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
          {/* Student ID with lock note */}
          <div className="sm:col-span-2 space-y-1.5">
            <Controller name="university_student_id" control={control}
              render={({ field }) => (
                <Input {...field} label={`${t("profile.studentId")} *`} placeholder="21060101"
                  isInvalid={!!formState.errors.university_student_id}
                  hint={formState.errors.university_student_id?.message}
                  isDisabled={isSubmitting} />
              )}
            />
            <div className="flex items-center gap-1.5 text-xs text-fg-tertiary">
              <LockIcon size={12} className="shrink-0" />
              <span>{t("setup.lockNote")}</span>
            </div>
          </div>

          <div className="sm:col-span-2">
            <Controller name="faculty_id" control={control}
              render={({ field }) => (
                <Select
                  label={`${t("personalInfo.faculty")} *`}
                  placeholder={t("personalInfo.facultyPlaceholder")}
                  items={facultyItems}
                  selectedKey={field.value || null}
                  onSelectionChange={(key) => field.onChange(String(key))}
                  isDisabled={isLoadingFaculties || isSubmitting}
                  isInvalid={!!formState.errors.faculty_id}
                  hint={formState.errors.faculty_id?.message}
                >
                  {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
              )}
            />
          </div>

          <Controller name="degree_level_id" control={control}
            render={({ field }) => (
              <Select
                label={`${t("personalInfo.degree")} *`}
                placeholder={t("personalInfo.degreePlaceholder")}
                items={degreeItems}
                selectedKey={field.value || null}
                onSelectionChange={(key) => field.onChange(String(key))}
                isDisabled={isLoadingDegrees || isSubmitting}
                isInvalid={!!formState.errors.degree_level_id}
                hint={formState.errors.degree_level_id?.message}
              >
                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
              </Select>
            )}
          />

          <Controller name="year_level_id" control={control}
            render={({ field }) => (
              <Select
                label={`${t("personalInfo.year")} *`}
                placeholder={t("personalInfo.yearPlaceholder")}
                items={yearItems}
                selectedKey={field.value || null}
                onSelectionChange={(key) => field.onChange(String(key))}
                isDisabled={isLoadingYears || isSubmitting}
                isInvalid={!!formState.errors.year_level_id}
                hint={formState.errors.year_level_id?.message}
              >
                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
              </Select>
            )}
          />
        </div>
      </Section>

      {/* ── Submit + Sign out ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-error-600 hover:bg-error-700 dark:bg-error-600 dark:hover:bg-error-500 text-white px-4 py-2.5 text-sm font-semibold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:ring-offset-2 w-full sm:w-auto"
        >
          <SignOutIcon size={16} weight="bold" />
          {t("profile.logoutButton")}
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full sm:w-auto min-w-[220px] justify-center items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 text-white px-6 py-2.5 text-sm font-semibold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? t("common.loading") : t("personalInfo.saveButton")}
        </button>
      </div>
    </form>
  );
}
