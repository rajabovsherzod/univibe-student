'use client';

import { useState, useRef } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { ComponentType } from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import {
  UserIcon, PencilSimpleIcon, CheckIcon, XIcon, CameraIcon,
  CheckCircleIcon, XCircleIcon, ClockIcon, GraduationCapIcon, IdentificationCardIcon,
  PhoneIcon, CalendarBlankIcon, BuildingsIcon, CalendarCheckIcon, ShieldIcon,
  TelegramLogoIcon,
} from '@phosphor-icons/react';
import { parseDate } from '@internationalized/date';

import {
  useStudentMe, useFaculties, useDegreeLevels, useYearLevels, useUpdateProfile,
} from '@/hooks/api/use-profile';
import { useTelegramAccount, useTelegramConnectLink, useDisconnectTelegram } from '@/hooks/api/use-telegram';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { Select } from '@/components/base/select/select';
import { SelectItem } from '@/components/base/select/select-item';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import { useTranslation } from '@/lib/i18n/i18n';

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
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

function fmtDate(s: string | null | undefined): string | null {
  if (!s) return null;
  try {
    const d = new Date(s);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return s; }
}

type StatusKey = 'approved' | 'waited' | 'rejected';

const STATUS_CFG: Record<StatusKey, {
  label: string;
  pill: string;
  ringCls: string;
  badgeBg: string;
  Icon: ComponentType<{ size?: number; weight?: 'fill' | 'regular' | 'bold'; className?: string }>;
}> = {
  approved: {
    label: 'Tasdiqlangan',
    pill: 'bg-success-100 text-success-700 dark:bg-success-600/20 dark:text-success-500',
    ringCls: 'ring-success-500',
    badgeBg: 'bg-success-500',
    Icon: CheckCircleIcon,
  },
  waited: {
    label: 'Kutilmoqda',
    pill: 'bg-warning-100 text-warning-700 dark:bg-warning-600/20 dark:text-warning-500',
    ringCls: 'ring-warning-500',
    badgeBg: 'bg-warning-500',
    Icon: ClockIcon,
  },
  rejected: {
    label: 'Rad etildi',
    pill: 'bg-error-100 text-error-700 dark:bg-error-600/20 dark:text-error-500',
    ringCls: 'ring-error-500',
    badgeBg: 'bg-error-500',
    Icon: XCircleIcon,
  },
};

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

export default function ProfilePage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
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
      name: '', surname: '', middle_name: '', date_of_birth: '',
      university_student_id: '', faculty_id: '', degree_level_id: '',
      year_level_id: '', contact_phone_number: '',
    },
  });

  const startEdit = () => {
    reset({
      name: profile?.name || '',
      surname: profile?.surname || '',
      middle_name: profile?.middle_name || '',
      date_of_birth: profile?.date_of_birth || '',
      university_student_id: profile?.university_student_id || '',
      faculty_id: profile?.faculty_public_id || '',
      degree_level_id: profile?.degree_level_public_id || '',
      year_level_id: profile?.year_level_public_id || '',
      contact_phone_number: profile?.contact_phone_number || '',
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
      if (v.name) fd.append('name', v.name);
      if (v.surname) fd.append('surname', v.surname);
      if (v.middle_name) fd.append('middle_name', v.middle_name);
      if (v.date_of_birth) fd.append('date_of_birth', v.date_of_birth);
      if (v.university_student_id) fd.append('university_student_id', v.university_student_id);
      if (v.faculty_id) fd.append('faculty_id', v.faculty_id);
      if (v.degree_level_id) fd.append('degree_level_id', v.degree_level_id);
      if (v.year_level_id) fd.append('year_level_id', v.year_level_id);
      if (v.contact_phone_number) fd.append('contact_phone_number', v.contact_phone_number);
      if (photoFile) fd.append('profile_photo', photoFile);

      await updateProfile(fd);
      toast.success("Profil yangilandi", { description: "Ma'lumotlaringiz saqlandi." });
      setEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: Record<string, unknown> } };
      const msg =
        (err?.response?.data?.detail as string) ||
        (Object.values(err?.response?.data || {}).flat().find((x): x is string => typeof x === 'string')) ||
        "Ma'lumotlarni saqlashda xatolik";
      toast.error("Xatolik", { description: String(msg) });
    } finally {
      setSaving(false);
    }
  };

  const sc = profile?.status ? STATUS_CFG[profile.status] : null;
  const displayName = profile?.full_name || session?.user?.name || 'Talaba';
  const avatarSrc = photoPreview || profile?.profile_photo_url;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-4 pb-10">

      {/* ── Hero card ── */}
      <div className="rounded-2xl border border-border-secondary bg-bg-secondary shadow-sm overflow-hidden">

        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 px-5 sm:px-6 py-6 sm:py-8">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px),radial-gradient(circle_at_70%_80%,white_1px,transparent_1px)] bg-[length:24px_24px]" />

          <div className="relative z-10 flex flex-col items-center sm:flex-row sm:items-center gap-4 sm:gap-5">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className={[
                'size-20 sm:size-24 rounded-2xl overflow-hidden bg-white/20 ring-4 ring-white/30',
                sc ? `ring-[3px] ${sc.ringCls}` : '',
              ].join(' ')}>
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
              {!isPending && sc && (
                <div className={[
                  'absolute -bottom-1 -right-1 size-7 rounded-lg',
                  sc.badgeBg,
                  'border-[3px] border-brand-600',
                  'flex items-center justify-center shadow-sm',
                ].join(' ')}>
                  <sc.Icon size={13} weight="fill" className="text-white" />
                </div>
              )}

              {/* Camera overlay (edit mode) */}
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

            {/* Name + details */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {isPending ? (
                  <div className="h-6 w-48 rounded-lg bg-white/20 animate-pulse" />
                ) : (
                  <>
                    <h1 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">{displayName}</h1>
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
            <Section title={t('profile.personalInfoSection')}>
              {isPending
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : (
                  <>
                    <InfoRow icon={UserIcon} label={t('auth.name')} value={profile?.name} />
                    <InfoRow icon={UserIcon} label={t('auth.surname')} value={profile?.surname} />
                    <InfoRow icon={UserIcon} label={t('profile.middleName')} value={profile?.middle_name} />
                    <InfoRow icon={CalendarBlankIcon} label={t('profile.dob')} value={fmtDate(profile?.date_of_birth)} />
                    <InfoRow icon={PhoneIcon} label={t('profile.phone')} value={profile?.contact_phone_number} />
                  </>
                )}
            </Section>

            <Section title={t('profile.academicSection')}>
              {isPending
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                : (
                  <>
                    <InfoRow icon={IdentificationCardIcon} label={t('profile.studentId')} value={profile?.university_student_id} />
                    <InfoRow icon={GraduationCapIcon} label={t('profile.faculty')} value={profile?.faculty_name} />
                    <InfoRow icon={GraduationCapIcon} label={t('profile.direction')} value={profile?.degree_level_name} />
                    <InfoRow icon={GraduationCapIcon} label={t('profile.year')} value={profile?.year_level_name} />
                  </>
                )}
            </Section>
          </div>

          {/* System info */}
          <Section title={t('profile.systemSection')}>
            {isPending
              ? <div className="py-1">{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
              : (
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border-secondary">
                  {/* Status */}
                  <div className="flex items-center gap-4 py-4 sm:pr-6">
                    <div className="size-9 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
                      <ShieldIcon size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest mb-1.5">{t('profile.status')}</p>
                      {sc ? (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${sc.pill}`}>
                          <sc.Icon size={11} weight="fill" />
                          {sc.label}
                        </span>
                      ) : <span className="text-sm text-fg-tertiary">—</span>}
                    </div>
                  </div>
                  {/* Registration date */}
                  <div className="flex items-center gap-4 py-4 sm:px-6">
                    <div className="size-9 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
                      <CalendarCheckIcon size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest mb-1">{t('profile.registeredAt')}</p>
                      <p className="text-base font-semibold text-fg-primary">{fmtDate(profile?.created_at) ?? '—'}</p>
                    </div>
                  </div>
                  {/* Last updated */}
                  <div className="flex items-center gap-4 py-4 sm:pl-6">
                    <div className="size-9 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
                      <CalendarBlankIcon size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest mb-1">{t('profile.lastUpdated')}</p>
                      <p className="text-base font-semibold text-fg-primary">{fmtDate(profile?.updated_at) ?? '—'}</p>
                    </div>
                  </div>
                </div>
              )}
          </Section>

          {/* Telegram ulash */}
          <TelegramSection />

          {/* Tizimdan chiqish */}
          <LogoutSection />
        </>
      ) : (
        /* ── EDIT MODE ── */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <Section title={t('profile.personalInfoSection')}>
            <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
              <Controller name="name" control={control}
                rules={{ required: 'Ism majburiy' }}
                render={({ field }) => (
                  <Input {...field} label={`${t('auth.name')} *`} placeholder="Alisher"
                    isInvalid={!!formState.errors.name}
                    hint={formState.errors.name?.message} />
                )}
              />
              <Controller name="surname" control={control}
                rules={{ required: 'Familiya majburiy' }}
                render={({ field }) => (
                  <Input {...field} label={`${t('auth.surname')} *`} placeholder="Toshmatov"
                    isInvalid={!!formState.errors.surname}
                    hint={formState.errors.surname?.message} />
                )}
              />
              <Controller name="middle_name" control={control}
                render={({ field }) => (
                  <Input {...field} label={t('profile.middleName')} placeholder="Baxtiyorovich" />
                )}
              />
              <Controller name="contact_phone_number" control={control}
                render={({ field }) => (
                  <Input {...field} label={t('profile.phone')} placeholder="+998901234567" type="tel" />
                )}
              />
              <Controller name="date_of_birth" control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-fg-primary">{t('profile.dob')}</label>
                    <DatePicker
                      value={field.value ? parseDate(field.value) : null}
                      onChange={(v) => field.onChange(v ? v.toString() : '')}
                      aria-label={t('profile.dob')}
                    />
                  </div>
                )}
              />
            </div>
          </Section>

          <Section title={t('profile.academicSection')}>
            <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
              <Controller name="university_student_id" control={control}
                render={({ field }) => (
                  <Input {...field} label={t('profile.studentId')} placeholder="21060101" />
                )}
              />
              <div />
              <Controller name="faculty_id" control={control}
                render={({ field }) => (
                  <Select label={t('profile.faculty')} placeholder={t('personalInfo.facultyPlaceholder')} size="md"
                    selectedKey={field.value || null}
                    onSelectionChange={(k) => field.onChange(k)}
                    items={faculties.map(f => ({ id: f.public_id, label: f.name }))}>
                    {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
                  </Select>
                )}
              />
              <Controller name="degree_level_id" control={control}
                render={({ field }) => (
                  <Select label={t('profile.direction')} placeholder={t('personalInfo.degreePlaceholder')} size="md"
                    selectedKey={field.value || null}
                    onSelectionChange={(k) => field.onChange(k)}
                    items={degreeLevels.map(d => ({ id: d.public_id, label: d.name }))}>
                    {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
                  </Select>
                )}
              />
              <Controller name="year_level_id" control={control}
                render={({ field }) => (
                  <Select label={t('profile.year')} placeholder={t('personalInfo.yearPlaceholder')} size="md"
                    selectedKey={field.value || null}
                    onSelectionChange={(k) => field.onChange(k)}
                    items={yearLevels.map(y => ({ id: y.public_id, label: y.name }))}>
                    {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
                  </Select>
                )}
              />
            </div>
          </Section>

          {/* Form actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              color="primary-destructive"
              size="md"
              onClick={cancelEdit}
              isDisabled={saving}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              color="primary"
              size="md"
              iconLeading={CheckIcon}
              isLoading={saving}
              isDisabled={saving}
            >
              Saqlash
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Telegram Section ──────────────────────────────────────────────────

function TelegramSection() {
  const { data: account, isLoading } = useTelegramAccount();
  const notLinked = account === null;
  const { data: connectLink, refetch: fetchLink, isFetching: linkLoading } = useTelegramConnectLink(false);
  const { mutate: disconnect, isPending: disconnecting } = useDisconnectTelegram();
  const [showDisconnect, setShowDisconnect] = useState(false);

  const handleConnect = async () => {
    const { data } = await fetchLink();
    if (data?.connect_link) {
      window.open(data.connect_link, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Section title="Telegram">
        <div className="py-4"><SkeletonRow /><SkeletonRow /></div>
      </Section>
    );
  }

  if (notLinked) {
    return (
      <div className="rounded-2xl border border-[#0088cc]/30 bg-[#0088cc]/5 dark:bg-[#0088cc]/10 shadow-sm overflow-hidden p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="size-11 rounded-xl bg-[#0088cc] flex items-center justify-center">
              <TelegramLogoIcon size={20} weight="fill" className="text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-success-500 border-2 border-white dark:border-bg-secondary animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-fg-primary mb-0.5">Telegram hisobingizni ulang</p>
            <p className="text-xs text-fg-tertiary mb-3 leading-relaxed">
              Yangiliklardan tezda xabardor bo'lish va muhim bildirishnomalarni o'tkazib yubormaslik uchun Telegram hisobingizni ulang.
            </p>
            <button
              type="button"
              onClick={handleConnect}
              disabled={linkLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0088cc] hover:bg-[#006daa] text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              <TelegramLogoIcon size={16} weight="fill" />
              {linkLoading ? 'Yuklanmoqda...' : 'Telegram ulash'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!account) return null;

  return (
    <Section title="Telegram">
      <div className="py-3">
        <div className="flex items-center gap-4 py-3 border-b border-border-secondary">
          <div className="size-9 rounded-xl bg-[#0088cc] flex items-center justify-center shrink-0">
            <TelegramLogoIcon size={16} weight="fill" className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest leading-none mb-1">Foydalanuvchi</p>
            <p className="text-base font-semibold text-fg-primary">
              {account.telegram_username ? `@${account.telegram_username}` : account.telegram_fullname}
            </p>
          </div>
        </div>
        {account.phone_number && (
          <div className="flex items-center gap-4 py-3 border-b border-border-secondary">
            <div className="size-9 rounded-xl bg-[#0088cc] flex items-center justify-center shrink-0">
              <PhoneIcon size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest leading-none mb-1">Telefon</p>
              <p className="text-base font-semibold text-fg-primary">{account.phone_number}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 py-3">
          <div className="size-9 rounded-xl bg-success-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon size={16} weight="fill" className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest leading-none mb-1">Holat</p>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-success-50 dark:bg-success-600/10 text-success-700 dark:text-success-400">
              <CheckCircleIcon size={11} weight="fill" />Ulangan
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowDisconnect(true)}
            disabled={disconnecting}
            className="text-xs font-medium text-error-600 dark:text-error-400 hover:underline disabled:opacity-60"
          >
            {disconnecting ? 'Uzilmoqda...' : 'Uzish'}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDisconnect}
        onClose={() => setShowDisconnect(false)}
        onConfirm={() => { disconnect(); setShowDisconnect(false); }}
        title="Telegramni uzish"
        description="Telegram hisobingiz uziladi va bildirishnomalar to'xtatiladi. Davom etishni xohlaysizmi?"
        confirmLabel="Uzish"
        cancelLabel="Bekor qilish"
        variant="danger"
        isLoading={disconnecting}
      />
    </Section>
  );
}

// ── Logout Section ───────────────────────────────────────────────────

function LogoutSection() {
  const [showLogout, setShowLogout] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Section title={t('profile.logoutSection')}>
        <div className="py-4">
          <button
            type="button"
            onClick={() => setShowLogout(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-error-600 hover:bg-error-700 dark:bg-error-600 dark:hover:bg-error-500 text-white px-4 py-2.5 text-sm font-semibold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:ring-offset-2"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            {t('profile.logoutButton')}
          </button>
        </div>
      </Section>

      <ConfirmModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={() => signOut({ callbackUrl: '/login' })}
        title={t('profile.logoutTitle')}
        description={t('profile.logoutDesc')}
        confirmLabel={t('profile.logoutConfirm')}
        cancelLabel={t('profile.logoutCancel')}
        variant="danger"
      />
    </>
  );
}
