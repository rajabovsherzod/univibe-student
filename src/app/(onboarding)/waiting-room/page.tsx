"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { parseDate } from "@internationalized/date";
import {
  UserIcon, PhoneIcon, CalendarBlankIcon, GraduationCapIcon,
  BuildingsIcon, PencilSimpleIcon, CheckIcon, CameraIcon, ClockIcon, XIcon, SignOutIcon,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import Image from "next/image";

import {
  useStudentMe, useFaculties, useDegreeLevels, useYearLevels, useUpdateProfile,
} from "@/hooks/api/use-profile";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { useTranslation } from "@/lib/i18n/i18n";

// ── Types ─────────────────────────────────────────────────────────────────
interface ProfileForm {
  name: string;
  surname: string;
  middle_name: string;
  date_of_birth: string;
  university_student_id: string;
  faculty_id: string;
  degree_level_id: string;
  year_level_id: string;
  contact_phone_number: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────
const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

function fmtDate(s: string | null | undefined): string | null {
  if (!s) return null;
  try {
    const d = new Date(s);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return s; }
}

// ── Sub-components ─────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon, label, value,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-border-secondary last:border-0">
      <div className="size-9 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest leading-none mb-1">
          {label}
        </p>
        <p className="text-base font-semibold text-fg-primary leading-snug">
          {value ?? <span className="font-normal text-fg-tertiary italic">Kiritilmagan</span>}
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-secondary bg-bg-secondary shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border-secondary">
        <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-border-secondary last:border-0">
      <div className="size-9 rounded-xl skeleton-shimmer shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-16 rounded skeleton-shimmer" />
        <div className="h-4 w-36 rounded-md skeleton-shimmer" />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function WaitingRoomPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, update: updateSession } = useSession();
  const { data: profile, isPending } = useStudentMe();
  const { mutateAsync: updateProfile } = useUpdateProfile();

  const universityId = profile?.university_public_id || session?.user?.universityId;
  const { data: faculties = [] } = useFaculties(universityId);
  const { data: degreeLevels = [] } = useDegreeLevels(universityId);
  const { data: yearLevels = [] } = useYearLevels(universityId);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, reset, formState } = useForm<ProfileForm>({
    defaultValues: {
      name: "", surname: "", middle_name: "", date_of_birth: "",
      university_student_id: "", faculty_id: "", degree_level_id: "",
      year_level_id: "", contact_phone_number: "",
    },
  });

  // Auto-advance if approved or rejected while waiting
  useEffect(() => {
    if (!profile) return;
    if (profile.status === "approved" || profile.status === "rejected") {
      const sessionStatus = session?.user?.studentStatus;
      if (sessionStatus !== profile.status) {
        updateSession({ studentStatus: profile.status }).then(() => router.push("/"));
      } else {
        router.push("/");
      }
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = () => {
    reset({
      name: profile?.name || "",
      surname: profile?.surname || "",
      middle_name: profile?.middle_name || "",
      date_of_birth: profile?.date_of_birth || "",
      university_student_id: profile?.university_student_id || "",
      faculty_id: profile?.faculty_public_id || "",
      degree_level_id: profile?.degree_level_public_id || "",
      year_level_id: profile?.year_level_public_id || "",
      contact_phone_number: profile?.contact_phone_number || "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (v: ProfileForm) => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (v.name) fd.append("name", v.name);
      if (v.surname) fd.append("surname", v.surname);
      if (v.middle_name) fd.append("middle_name", v.middle_name);
      if (v.date_of_birth) fd.append("date_of_birth", v.date_of_birth);
      if (v.university_student_id) fd.append("university_student_id", v.university_student_id);
      if (v.faculty_id) fd.append("faculty_id", v.faculty_id);
      if (v.degree_level_id) fd.append("degree_level_id", v.degree_level_id);
      if (v.year_level_id) fd.append("year_level_id", v.year_level_id);
      if (v.contact_phone_number) fd.append("contact_phone_number", v.contact_phone_number);
      if (photoFile) fd.append("profile_photo", photoFile);

      await updateProfile(fd);
      toast.success("Profil yangilandi", { description: "Ma'lumotlaringiz saqlandi." });
      setEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: Record<string, unknown> } };
      const msg =
        (err?.response?.data?.detail as string) ||
        (Object.values(err?.response?.data || {}).flat().find((x): x is string => typeof x === "string")) ||
        "Ma'lumotlarni saqlashda xatolik";
      toast.error("Xatolik", { description: String(msg) });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    try { localStorage.clear(); sessionStorage.clear(); } catch { }
    signOut({ callbackUrl: `${window.location.origin}/login` });
  };

  const displayName = profile?.full_name?.replace(/\bUser\b/gi, "").trim() || session?.user?.name || "Talaba";
  const avatarSrc = photoPreview || profile?.profile_photo_url;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-4 pb-10">

      {/* ── Status banner ── */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-border-secondary bg-bg-secondary shadow-xs px-4 py-3.5">
        <div className="size-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 ring-1 ring-brand-200/60 dark:ring-brand-500/25 flex items-center justify-center shrink-0">
          <ClockIcon size={17} weight="fill" className="text-brand-600 dark:text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-fg-primary">
            {t("waiting.title")}
          </p>
          <p className="text-xs text-fg-tertiary leading-relaxed mt-0.5">
            {t("waiting.description")}
          </p>
        </div>
        <div className="shrink-0 hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-1 ring-brand-200 dark:ring-brand-500/25">
          <span className="size-1.5 rounded-full bg-brand-500 animate-pulse" />
          Tekshiruvda
        </div>
      </div>

      {/* ── Hero card ── */}
      <div className="rounded-2xl border border-border-secondary bg-bg-secondary shadow-sm overflow-hidden">
        <div className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 px-5 sm:px-6 py-6 sm:py-8">
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px),radial-gradient(circle_at_70%_80%,white_1px,transparent_1px)] bg-[length:24px_24px]" />

          <div className="relative z-10 flex flex-col items-center sm:flex-row sm:items-center gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="size-20 sm:size-24 rounded-2xl overflow-hidden bg-white/20 ring-[3px] ring-warning-400/70">
                {isPending ? (
                  <div className="size-full skeleton-shimmer" />
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
                  <div className="size-full flex items-center justify-center text-white font-bold text-3xl select-none">
                    {initial}
                  </div>
                )}
              </div>

              {/* Status badge */}
              {!isPending && (
                <div className="absolute -bottom-1 -right-1 size-7 rounded-lg bg-warning-500 border-[3px] border-brand-600 flex items-center justify-center shadow-sm">
                  <ClockIcon size={13} weight="fill" className="text-white" />
                </div>
              )}

              {/* Camera overlay in edit mode */}
              {editing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <CameraIcon size={22} weight="fill" className="text-white" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
                </>
              )}
            </div>

            {/* Name + info */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {isPending ? (
                  <div className="h-6 w-48 rounded-lg bg-white/20 animate-pulse" />
                ) : (
                  <>
                    <h1 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">
                      {displayName}
                    </h1>
                    {!editing && (
                      <button
                        type="button"
                        onClick={startEdit}
                        aria-label="Tahrirlash"
                        className="shrink-0 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <PencilSimpleIcon size={14} weight="bold" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {isPending ? (
                <div className="space-y-1.5 mt-2">
                  <div className="h-3.5 w-40 rounded bg-white/15 animate-pulse mx-auto sm:mx-0" />
                  <div className="h-3.5 w-32 rounded bg-white/15 animate-pulse mx-auto sm:mx-0" />
                </div>
              ) : (
                <div className="mt-1.5">
                  <p className="text-sm text-white/70">{profile?.email || session?.user?.email}</p>
                  {profile?.university_name && (
                    <p className="mt-1 flex items-center justify-center sm:justify-start gap-1.5 text-sm text-white/80">
                      <BuildingsIcon size={14} className="text-white/60 shrink-0" />
                      {profile.university_name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── VIEW MODE ── */}
      {!editing ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section title={t("profile.personalInfoSection")}>
              {isPending
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                : (
                  <>
                    <InfoRow icon={UserIcon} label={t("auth.name")} value={profile?.name} />
                    <InfoRow icon={UserIcon} label={t("auth.surname")} value={profile?.surname} />
                    <InfoRow icon={UserIcon} label={t("profile.middleName")} value={profile?.middle_name} />
                    <InfoRow icon={CalendarBlankIcon} label={t("profile.dob")} value={fmtDate(profile?.date_of_birth)} />
                    <InfoRow icon={PhoneIcon} label={t("profile.phone")} value={profile?.contact_phone_number} />
                  </>
                )}
            </Section>

            <Section title={t("profile.academicSection")}>
              {isPending
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                : (
                  <>
                    <InfoRow icon={GraduationCapIcon} label={t("profile.faculty")} value={profile?.faculty_name} />
                    <InfoRow icon={GraduationCapIcon} label={t("profile.direction")} value={profile?.degree_level_name} />
                    <InfoRow icon={GraduationCapIcon} label={t("profile.year")} value={profile?.year_level_name} />
                  </>
                )}
            </Section>
          </div>

          {/* Sign out */}
          <Section title={t("profile.logoutSection")}>
            <div className="py-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
              >
                <SignOutIcon size={16} />
                {t("profile.logoutButton")}
              </button>
            </div>
          </Section>
        </>
      ) : (
        /* ── EDIT MODE ── */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Section title={t("profile.personalInfoSection")}>
            <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
              <Controller name="name" control={control}
                rules={{ required: "Ism majburiy" }}
                render={({ field }) => (
                  <Input {...field} label={`${t("auth.name")} *`} placeholder="Alisher"
                    isInvalid={!!formState.errors.name}
                    hint={formState.errors.name?.message} />
                )}
              />
              <Controller name="surname" control={control}
                rules={{ required: "Familiya majburiy" }}
                render={({ field }) => (
                  <Input {...field} label={`${t("auth.surname")} *`} placeholder="Toshmatov"
                    isInvalid={!!formState.errors.surname}
                    hint={formState.errors.surname?.message} />
                )}
              />
              <Controller name="middle_name" control={control}
                render={({ field }) => (
                  <Input {...field} label={t("profile.middleName")} placeholder="Baxtiyorovich" />
                )}
              />
              <Controller name="contact_phone_number" control={control}
                render={({ field }) => (
                  <Input {...field} label={t("profile.phone")} placeholder="+998901234567" type="tel" />
                )}
              />
              <Controller name="date_of_birth" control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-fg-primary">{t("profile.dob")}</label>
                    <DatePicker
                      value={field.value ? parseDate(field.value) : null}
                      onChange={(v) => field.onChange(v ? v.toString() : "")}
                      aria-label={t("profile.dob")}
                    />
                  </div>
                )}
              />
            </div>
          </Section>

          <Section title={t("profile.academicSection")}>
            <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
              <Controller name="university_student_id" control={control}
                render={({ field }) => (
                  <Input {...field} label={t("profile.studentId")} placeholder="21060101" />
                )}
              />
              <div />
              <Controller name="faculty_id" control={control}
                render={({ field }) => (
                  <Select label={t("profile.faculty")} placeholder={t("personalInfo.facultyPlaceholder")} size="md"
                    selectedKey={field.value || null}
                    onSelectionChange={(k) => field.onChange(k)}
                    items={faculties.map(f => ({ id: f.public_id, label: f.name }))}>
                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                  </Select>
                )}
              />
              <Controller name="degree_level_id" control={control}
                render={({ field }) => (
                  <Select label={t("profile.direction")} placeholder={t("personalInfo.degreePlaceholder")} size="md"
                    selectedKey={field.value || null}
                    onSelectionChange={(k) => field.onChange(k)}
                    items={degreeLevels.map(d => ({ id: d.public_id, label: d.name }))}>
                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                  </Select>
                )}
              />
              <Controller name="year_level_id" control={control}
                render={({ field }) => (
                  <Select label={t("profile.year")} placeholder={t("personalInfo.yearPlaceholder")} size="md"
                    selectedKey={field.value || null}
                    onSelectionChange={(k) => field.onChange(k)}
                    items={yearLevels.map(y => ({ id: y.public_id, label: y.name }))}>
                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                  </Select>
                )}
              />
            </div>
          </Section>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-fg-secondary hover:text-fg-primary transition-colors disabled:opacity-50"
            >
              <XIcon size={16} />
              {t("common.cancel")}
            </button>
            <Button
              type="submit"
              color="primary"
              size="md"
              iconLeading={CheckIcon}
              isLoading={saving}
              isDisabled={saving}
            >
              {t("common.save")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
