'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  ArrowLeftIcon, CalendarDotsIcon, ClockIcon, MapPinIcon, UsersThreeIcon,
  BuildingsIcon, CheckCircleIcon, QrCodeIcon,
} from '@phosphor-icons/react';
import {
  useEvent, useRegisterEvent, useCancelEventRegistration, useConfirmAttendance,
} from '@/hooks/api/use-events';
import { QrScannerModal } from '@/components/student/QrScannerModal';
import { CoinPill } from '@/components/student/CoinPill';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n/i18n';
import { toHttps } from '@/utils/cx';
import { playCelebration } from '@/utils/celebration';
import { eventWhen } from '@/utils/date';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { t, locale } = useTranslation();

  const { data: event, isPending } = useEvent(id);
  const { mutate: register, isPending: isRegistering } = useRegisterEvent();
  const { mutate: cancel, isPending: isCancelling } = useCancelEventRegistration();
  const { mutate: confirmAttendance, isPending: isConfirming } = useConfirmAttendance();

  const [scannerOpen, setScannerOpen] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const registrationClosed = event?.registration_end ? new Date(event.registration_end) < new Date() : false;
  const isFull = event?.participant_limit != null && event.registered_count >= event.participant_limit;
  const attended = event?.registration_status === 'ATTENDED';

  const handleRegister = () => register(id, {
    onSuccess: () => toast.success(t('events.registerSuccess')),
    onError: (e: any) => toast.error(e?.response?.data?.detail || t('common.error')),
  });
  const handleCancel = () => cancel(id, {
    onSuccess: () => toast.success(t('events.cancelSuccess')),
    onError: (e: any) => toast.error(e?.response?.data?.detail || t('common.error')),
  });
  const handleScanned = (token: string) => { setScannerOpen(false); setPendingToken(token); };
  const handleConfirmAttendance = () => {
    if (!pendingToken) return;
    confirmAttendance({ id, token: pendingToken }, {
      onSuccess: (data) => {
        setPendingToken(null);
        playCelebration();
        // coins_awarded is a boolean flag; the actual amount is the event reward.
        const reward = event?.coin_reward ?? 0;
        toast.success(t('events.attendanceConfirmed'), {
          description: data?.coins_awarded && reward > 0 ? `+${reward} ${t('events.coins') || 'coin'}` : undefined,
        });
      },
      onError: (e: any) => {
        setPendingToken(null);
        toast.error(e?.response?.data?.error || e?.response?.data?.detail || t('common.error'));
      },
    });
  };

  if (isPending) {
    return (
      <div className="space-y-4 pb-10">
        <div className="h-8 w-24 rounded-lg skeleton-shimmer" />
        <div className="aspect-[16/9] rounded-2xl skeleton-shimmer" />
        <div className="h-7 w-2/3 rounded-lg skeleton-shimmer" />
        <div className="h-40 rounded-2xl skeleton-shimmer" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="rounded-2xl bg-bg-secondary shadow-sm py-16 text-center">
        <CalendarDotsIcon size={48} weight="light" className="mx-auto mb-4 text-fg-quaternary" />
        <p className="text-sm text-fg-tertiary">{t('events.emptyTitle') || 'Tadbir topilmadi'}</p>
        <button onClick={() => router.push('/events')} className="mt-4 text-sm font-semibold text-brand-600 hover:underline">
          {t('events.backToEvents') || 'Tadbirlarga qaytish'}
        </button>
      </div>
    );
  }

  const organizer = event.organizer_club_name || event.organizer_staff_name;
  const banner = toHttps(event.banner);
  const fillPct = event.participant_limit ? Math.min(100, Math.round((event.registered_count / event.participant_limit) * 100)) : 0;

  return (
    <div className="space-y-5 pb-10">
      {/* Back */}
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-tertiary transition-colors hover:text-fg-primary">
        <ArrowLeftIcon size={16} /> {t('events.backToEvents') || 'Orqaga'}
      </button>

      {/* Hero banner */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-bg-tertiary shadow-sm sm:aspect-[21/9]">
        {banner ? (
          <Image src={banner} alt={event.title} fill className="object-cover" unoptimized priority />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-bg-tertiary via-bg-tertiary to-brand-500/15">
            <Image src="/svgs/event.svg" alt="" width={320} height={220} className="h-auto w-1/3 max-w-[240px] object-contain opacity-95" unoptimized priority />
          </div>
        )}
        {attended ? (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-success-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md">
            <CheckCircleIcon size={14} weight="fill" /> {t('events.attended') || 'Qatnashdingiz'}
          </div>
        ) : event.is_registered ? (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md">
            <CheckCircleIcon size={14} weight="fill" /> {t('events.registered')}
          </div>
        ) : null}
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold leading-tight text-fg-primary sm:text-2xl">{event.title}</h1>

      {/* Content grid — action card first on mobile, right/sticky on desktop */}
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_340px] lg:items-start">
        {/* ── Action / info card ── */}
        <aside className="order-1 lg:order-2 lg:sticky lg:top-6">
          <div className="rounded-2xl bg-bg-secondary p-5 shadow-sm">
            {/* Reward */}
            {event.coin_reward > 0 && (
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-fg-quaternary">{t('events.reward')}</p>
                  <p className="text-sm text-fg-tertiary">{t('events.rewardDesc') || 'Qatnashganingiz uchun'}</p>
                </div>
                <CoinPill amount={event.coin_reward} size="md" variant="gold" />
              </div>
            )}

            {/* Meta */}
            <div className="space-y-3">
              <MetaRow icon={ClockIcon} label={t('events.when')} value={eventWhen(event.start_time, locale)} />
              {event.location && <MetaRow icon={MapPinIcon} label={t('events.location')} value={event.location} />}
              {organizer && <MetaRow icon={BuildingsIcon} label={t('events.organizer')} value={organizer} />}
            </div>

            {/* Participants */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-fg-tertiary"><UsersThreeIcon size={14} /> {t('events.participants')}</span>
                <span className="font-semibold text-fg-primary">
                  {event.registered_count}{event.participant_limit ? ` / ${event.participant_limit}` : ''}
                </span>
              </div>
              {event.participant_limit ? (
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
                  <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${fillPct}%` }} />
                </div>
              ) : null}
            </div>

            {/* Actions */}
            <div className="mt-5">
              {attended ? (
                <div className="flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold text-success-600 dark:text-success-400">
                  <CheckCircleIcon size={18} weight="fill" /> {t('events.attended') || 'Qatnashdingiz'}
                </div>
              ) : event.is_registered ? (
                <div className="space-y-2.5">
                  <button onClick={() => setScannerOpen(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700">
                    <QrCodeIcon size={18} weight="fill" /> {t('events.confirmAttendance') || 'Davomatni tasdiqlash'}
                  </button>
                  <button onClick={handleCancel} disabled={isCancelling} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-bg-tertiary px-6 py-2.5 text-sm font-semibold text-fg-secondary transition-colors hover:bg-bg-primary disabled:opacity-60">
                    {isCancelling ? <Spinner className="size-5" /> : t('events.cancelRegistration')}
                  </button>
                </div>
              ) : (
                <button onClick={handleRegister} disabled={isRegistering || registrationClosed || isFull} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {isRegistering ? <Spinner className="size-5" /> : isFull ? t('events.full') : registrationClosed ? (t('events.registrationClosed') || t('events.full')) : t('events.register')}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ── About ── */}
        <div className="order-2 lg:order-1">
          {event.description ? (
            <div className="rounded-2xl bg-bg-secondary p-5 shadow-sm">
              <h2 className="mb-2.5 text-sm font-bold text-fg-primary">{t('events.about')}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-fg-secondary">{event.description}</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-bg-secondary p-8 text-center text-sm text-fg-tertiary shadow-sm">
              {t('events.noDescription') || "Tadbir haqida qo'shimcha ma'lumot yo'q."}
            </div>
          )}
        </div>
      </div>

      {/* QR scanner */}
      <QrScannerModal isOpen={scannerOpen} onScan={handleScanned} onClose={() => setScannerOpen(false)} />

      {/* Confirm-attendance dialog */}
      {pendingToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-bg-secondary p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand-50 ring-8 ring-brand-50/50 dark:bg-brand-500/10 dark:ring-brand-500/10">
              <QrCodeIcon size={26} weight="fill" className="text-brand-600" />
            </div>
            <h3 className="text-base font-bold text-fg-primary">{t('events.confirmAttendanceTitle') || 'Davomatni tasdiqlaysizmi?'}</h3>
            <p className="mt-1.5 text-sm text-fg-tertiary">
              <span className="font-semibold text-fg-secondary">{event.title}</span> {t('events.confirmAttendanceDesc') || 'tadbiri uchun davomatingiz belgilanadi.'}
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setPendingToken(null)} disabled={isConfirming} className="flex-1 rounded-xl bg-bg-tertiary px-4 py-2.5 text-sm font-semibold text-fg-primary transition-colors hover:bg-bg-primary disabled:opacity-60">
                {t('common.cancel')}
              </button>
              <button onClick={handleConfirmAttendance} disabled={isConfirming} className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-60">
                {isConfirming ? <Spinner className="size-5" /> : t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetaRow({
  icon: Icon, label, value,
}: {
  icon: React.ComponentType<{ size?: number; weight?: 'regular' | 'fill'; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-bg-tertiary text-brand-600">
        <Icon size={16} weight="fill" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-fg-quaternary">{label}</p>
        <p className="truncate text-sm font-medium text-fg-primary">{value}</p>
      </div>
    </div>
  );
}
