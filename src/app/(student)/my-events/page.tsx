'use client';

import { useMemo, useState } from 'react';
import { TicketIcon, CheckCircleIcon, ClockCountdownIcon } from '@phosphor-icons/react';
import { useEvents } from '@/hooks/api/use-events';
import { EventListCard, EventCardSkeleton } from '@/components/student/EventListCard';
import { useTranslation } from '@/lib/i18n/i18n';

type Tab = 'registered' | 'attended';

export default function MyEventsPage() {
  const { t } = useTranslation();
  const { data: events = [], isPending } = useEvents();
  const [tab, setTab] = useState<Tab>('registered');

  // Split the student's events by their own registration status.
  const { registered, attended } = useMemo(() => {
    const mine = events.filter((e) => e.is_registered);
    return {
      registered: mine.filter((e) => e.registration_status !== 'ATTENDED'),
      attended: mine.filter((e) => e.registration_status === 'ATTENDED'),
    };
  }, [events]);

  const list = tab === 'attended' ? attended : registered;

  const tabs: { key: Tab; label: string; icon: typeof TicketIcon; count: number }[] = [
    { key: 'registered', label: t('myEvents.tabRegistered') || "Ro'yxatdan o'tilgan", icon: ClockCountdownIcon, count: registered.length },
    { key: 'attended', label: t('myEvents.tabAttended') || 'Qatnashgan', icon: CheckCircleIcon, count: attended.length },
  ];

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-5 sm:p-6">
        <div className="absolute -right-4 -top-4 opacity-[0.06] pointer-events-none select-none">
          <TicketIcon size={140} weight="fill" className="text-brand-400 rotate-12" />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-fg-primary">{t('events.myEvents') || 'Mening tadbirlarim'}</h1>
          <p className="mt-0.5 text-xs sm:text-sm text-fg-tertiary">
            {t('myEvents.subtitle') || "Ro'yxatdan o'tgan va qatnashgan tadbirlaringizni kuzating"}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="inline-flex w-full gap-1 rounded-xl border border-border-secondary bg-bg-secondary p-1 shadow-sm sm:w-auto">
        {tabs.map(({ key, label, icon: Icon, count }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1.5 py-1.5 text-[13px] font-semibold transition-colors sm:gap-1.5 sm:px-3.5 sm:py-2 sm:text-sm sm:flex-none ${
                active
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-fg-tertiary hover:bg-bg-tertiary hover:text-fg-secondary'
              }`}
            >
              <Icon size={15} weight="fill" className="shrink-0" />
              <span className="truncate">{label}</span>
              <span
                className={`inline-flex min-w-[1.1rem] shrink-0 items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold leading-none ${
                  active ? 'bg-white/20 text-white' : 'bg-bg-tertiary text-fg-tertiary'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {isPending ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : list.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {list.map((e) => <EventListCard key={e.public_id} event={e} />)}
        </div>
      ) : (
        <div className="rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm py-16 text-center">
          <TicketIcon size={48} weight="light" className="mx-auto mb-4 text-fg-quaternary" />
          <h3 className="mb-1 text-base font-semibold text-fg-primary">{t('events.myEvents') || 'Mening tadbirlarim'}</h3>
          <p className="mx-auto max-w-md text-sm text-fg-tertiary">
            {tab === 'attended'
              ? (t('myEvents.emptyAttended') || 'Hali birorta tadbirda qatnashmagansiz')
              : (t('myEvents.emptyRegistered') || "Ro'yxatdan o'tgan tadbirlaringiz yo'q")}
          </p>
        </div>
      )}
    </div>
  );
}
