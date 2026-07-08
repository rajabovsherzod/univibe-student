"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parseDate } from "@internationalized/date";
import Image from "next/image";
import { performLogout } from "@/lib/logout";
import {
  CameraIcon, BuildingsIcon, SignOutIcon, LockIcon, ClockIcon,
  UserIcon, GraduationCapIcon, EnvelopeSimpleIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "@/lib/i18n/i18n";

import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { DatePicker } from "@/components/application/date-picker/date-picker";

import {
  useFaculties,
  useDegreeLevels,
  useYearLevels,
  useUpdateProfile,
} from "@/hooks/api/use-profile";
import { useUniversities } from "@/hooks/api/use-university";
import { cx } from "@/utils/cx";

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
function Section({
  title,
  description,
  icon: Icon,
  step,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ size?: number; weight?: "regular" | "bold" | "fill"; className?: string }>;
  step?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border-secondary bg-bg-secondary shadow-sm overflow-hidden">
      <div className="flex items-center gap-3.5 px-5 py-4 border-b border-border-secondary bg-bg-secondary">
        {Icon && (
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/25">
            <Icon size={19} weight="fill" />
            {step != null && (
              <span className="absolute -right-1.5 -top-1.5 flex size-4.5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white ring-2 ring-bg-secondary">
                {step}
              </span>
            )}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-fg-primary leading-tight">{title}</p>
          {description && <p className="mt-0.5 text-xs text-fg-tertiary leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

// ── Per-field skeleton (label + control) ───────────────────────────────────────
function FieldSkeleton({ full = false, label = true }: { full?: boolean; label?: boolean }) {
  return (
    <div className={cx("space-y-1.5", full && "sm:col-span-2")}>
      {label && <div className="h-3.5 w-24 rounded skeleton-shimmer" />}
      <div className="h-11 rounded-lg skeleton-shimmer" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SetupProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  // The setup page runs BEFORE a student profile exists, so we must NOT call
  // /student/me/ (it 403/404s). Everything the form needs to pre-fill — name,
  // surname, email, university, status — is already carried in the auth session
  // (populated from the login/OTP response). Source it from there.
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const updateProfile = useUpdateProfile();
  const { data: universities } = useUniversities();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const studentStatus = session?.user?.studentStatus;
  const universityId = session?.user?.universityId || undefined;

  // Already approved/rejected → the setup page isn't for them; go home.
  useEffect(() => {
    if (studentStatus === "approved" || studentStatus === "rejected") {
      router.push("/");
    }
  }, [studentStatus]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Pre-fill name/surname from the full name the student entered at signup
  // (carried in the session).
  useEffect(() => {
    const fullName = (session?.user?.name || "").replace(/\bUser\b/gi, "").trim();
    if (!fullName) return;
    const v = getValues();
    const parts = fullName.split(/\s+/);
    if (!v.name && parts[0]) setValue("name", parts[0]);
    if (!v.surname && parts.length > 1) setValue("surname", parts.slice(1).join(" "));
  }, [session?.user?.name]); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Flatten DRF field errors ({"error": {"university_student_id": ["msg"]}})
      // into a readable sentence instead of dumping JSON.
      const flatten = (v: unknown): string | undefined => {
        if (!v) return undefined;
        if (typeof v === "string") return v;
        if (Array.isArray(v)) return v.map(flatten).filter(Boolean).join(" ");
        if (typeof v === "object") return Object.values(v as Record<string, unknown>).map(flatten).filter(Boolean).join(" ");
        return undefined;
      };
      const msg =
        (errData && typeof errData === "object" && (
          ("detail"  in errData ? errData.detail  : undefined) ||
          ("message" in errData ? errData.message : undefined) ||
          ("error" in errData ? flatten((errData as Record<string, unknown>).error) : undefined)
        )) || flatten(errData) || t("setup.saveError");
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
    performLogout();
  };

  const isSubmitting = updateProfile.isPending;

  // Display values for the hero card — all from the session.
  const displayName = (session?.user?.name || "").replace(/\bUser\b/gi, "").trim() || "Talaba";
  const displayEmail = session?.user?.email;
  const universityName = (universities || []).find((u) => u.public_id === universityId)?.name;
  const avatarSrc = photoPreview;
  const initial = displayName.charAt(0).toUpperCase();

  const facultyItems    = (faculties    || []).map(f => ({ id: f.public_id, label: f.name }));
  const degreeItems     = (degreeLevels || []).map(d => ({ id: d.public_id, label: d.name }));
  const yearItems       = (yearLevels   || []).map(y => ({ id: y.public_id, label: y.name }));

  // Per-field loading flags — the form layout stays mounted & stable; only the
  // pieces that receive data (name/surname from the session) show a brief
  // skeleton while the session itself is still resolving.
  const sessionLoading = sessionStatus === "loading";

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-10">

      {/* ── HERO — illustration + welcome + avatar ── */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-700/20 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 shadow-lg shadow-brand-900/10">
        {/* decorative layers */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:22px_22px]" />
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-12 size-64 rounded-full bg-brand-800/30 blur-3xl" />

        <div className="relative p-6 sm:p-8 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
          {/* Left column — heading (+ small illustration on mobile), avatar/identity */}
          <div className="flex flex-col gap-5 lg:order-first">
            {/* Row: text on the left, compact illustration on the right (mobile/tablet) */}
            <div className="flex items-center gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm">
                    <span className="size-1.5 rounded-full bg-white" />
                    {t("setup.heroStep")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90 ring-1 ring-white/20">
                    <ClockIcon size={12} weight="fill" />
                    {t("setup.bannerBadge")}
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">{t("setup.bannerTitle")}</h1>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">{t("setup.bannerDesc")}</p>
                </div>
              </div>

              {/* Compact illustration — ~30% on the right, mobile & tablet only */}
              <div className="w-[30%] max-w-[128px] shrink-0 self-center lg:hidden">
                <Image src="/svgs/setup-profile.svg" alt="" width={200} height={200} priority className="w-full drop-shadow-lg" />
              </div>
            </div>

            {/* Avatar + identity card */}
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-sm">
              <div className="relative shrink-0">
                <div className="size-16 overflow-hidden rounded-2xl bg-white/20 ring-2 ring-white/40">
                  {sessionLoading ? (
                    <div className="size-full animate-pulse bg-white/25" />
                  ) : avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={displayName}
                      width={96}
                      height={96}
                      className="size-full object-cover"
                      unoptimized={!!photoPreview}
                    />
                  ) : (
                    <div className="flex size-full select-none items-center justify-center text-2xl font-bold text-white">
                      {initial}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label={t("setup.avatarHint")}
                  className="absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full bg-white text-brand-600 shadow-md ring-2 ring-brand-500 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                >
                  <CameraIcon size={14} weight="fill" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-white">{displayName}</p>
                {displayEmail && (
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-white/70">
                    <EnvelopeSimpleIcon size={12} className="shrink-0" />
                    <span className="truncate">{displayEmail}</span>
                  </p>
                )}
                {universityName && (
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-white/80">
                    <BuildingsIcon size={12} className="shrink-0" />
                    <span className="truncate">{universityName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Illustration — desktop right column */}
          <div className="hidden shrink-0 lg:order-last lg:block lg:w-60">
            <Image src="/svgs/setup-profile.svg" alt="" width={320} height={320} priority className="w-full drop-shadow-xl" />
          </div>
        </div>
      </div>

      {/* ── Shaxsiy ma'lumotlar ── */}
      <Section title={t("profile.personalInfoSection")} description={t("setup.heroPersonalDesc")} icon={UserIcon} step={1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
          {sessionLoading ? <FieldSkeleton /> : (
            <Controller name="name" control={control}
              render={({ field }) => (
                <Input {...field} label={`${t("auth.name")} *`} placeholder="Alisher"
                  isInvalid={!!formState.errors.name}
                  hint={formState.errors.name?.message}
                  isDisabled={isSubmitting} />
              )}
            />
          )}
          {sessionLoading ? <FieldSkeleton /> : (
            <Controller name="surname" control={control}
              render={({ field }) => (
                <Input {...field} label={`${t("auth.surname")} *`} placeholder="Toshmatov"
                  isInvalid={!!formState.errors.surname}
                  hint={formState.errors.surname?.message}
                  isDisabled={isSubmitting} />
              )}
            />
          )}
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
                  aria-label={t("personalInfo.dob")}
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
      <Section title={t("profile.academicSection")} description={t("setup.heroAcademicDesc")} icon={GraduationCapIcon} step={2}>
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

          {isLoadingFaculties ? <FieldSkeleton full /> : (
            <div className="sm:col-span-2">
              <Controller name="faculty_id" control={control}
                render={({ field }) => (
                  <Select
                    label={`${t("personalInfo.faculty")} *`}
                    placeholder={t("personalInfo.facultyPlaceholder")}
                    items={facultyItems}
                    selectedKey={field.value || null}
                    onSelectionChange={(key) => field.onChange(String(key))}
                    isDisabled={isSubmitting}
                    isInvalid={!!formState.errors.faculty_id}
                    hint={formState.errors.faculty_id?.message}
                  >
                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                  </Select>
                )}
              />
            </div>
          )}

          {isLoadingDegrees ? <FieldSkeleton /> : (
            <Controller name="degree_level_id" control={control}
              render={({ field }) => (
                <Select
                  label={`${t("personalInfo.degree")} *`}
                  placeholder={t("personalInfo.degreePlaceholder")}
                  items={degreeItems}
                  selectedKey={field.value || null}
                  onSelectionChange={(key) => field.onChange(String(key))}
                  isDisabled={isSubmitting}
                  isInvalid={!!formState.errors.degree_level_id}
                  hint={formState.errors.degree_level_id?.message}
                >
                  {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
              )}
            />
          )}

          {isLoadingYears ? <FieldSkeleton /> : (
            <Controller name="year_level_id" control={control}
              render={({ field }) => (
                <Select
                  label={`${t("personalInfo.year")} *`}
                  placeholder={t("personalInfo.yearPlaceholder")}
                  items={yearItems}
                  selectedKey={field.value || null}
                  onSelectionChange={(key) => field.onChange(String(key))}
                  isDisabled={isSubmitting}
                  isInvalid={!!formState.errors.year_level_id}
                  hint={formState.errors.year_level_id?.message}
                >
                  {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
              )}
            />
          )}
        </div>
      </Section>

      {/* ── Submit + Sign out ── */}
      <div className="flex flex-col-reverse gap-3 rounded-2xl border border-border-secondary bg-bg-secondary p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-error-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-error-700 dark:bg-error-600 dark:hover:bg-error-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:ring-offset-2 sm:w-auto cursor-pointer"
        >
          <SignOutIcon size={16} weight="bold" />
          {t("profile.logoutButton")}
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full min-w-[220px] items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-600 dark:hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:w-auto cursor-pointer"
        >
          {isSubmitting ? (
            <Spinner className="size-5 text-white" />
          ) : (
            t("personalInfo.saveButton")
          )}
        </button>
      </div>
    </form>
  );
}
