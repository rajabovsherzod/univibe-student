'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ClockIcon, MapPinIcon, UsersThreeIcon, CheckCircleIcon,
} from '@phosphor-icons/react';
import type { StudentEvent } from '@/hooks/api/use-events';
import { CoinPill } from '@/components/student/CoinPill';
import { useTranslation } from '@/lib/i18n/i18n';
import { toHttps } from '@/utils/cx';
import { monthShort, dayPad, timeHM } from '@/utils/date';

export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-secondary bg-bg-secondary shadow-sm overflow-hidden flex flex-col">
      <div className="aspect-[16/10] skeleton-shimmer" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 w-3/4 rounded skeleton-shimmer" />
        <div className="h-3 w-1/2 rounded skeleton-shimmer" />
        <div className="h-3 w-2/3 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}

export const EventListCard = memo(function EventListCard({ event }: { event: StudentEvent }) {
  const { t, locale } = useTranslation();
  const day = dayPad(event.start_time);
  const month = monthShort(event.start_time, locale);
  const time = timeHM(event.start_time, locale);

  const organizer = event.organizer_club_name || event.organizer_staff_name;
  const banner = toHttps(event.banner);

  return (
    <Link
      href={`/events/${event.public_id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border-secondary bg-bg-secondary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border-brand hover:shadow-lg"
    >
      {/* Banner */}
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-bg-tertiary">
        {banner ? (
          <Image src={banner} alt={event.title} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" unoptimized />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-bg-tertiary via-bg-tertiary to-brand-500/15">
            <Image src="/svgs/event.svg" alt="" width={220} height={160} className="h-auto w-1/2 max-w-[150px] object-contain opacity-95 transition-transform duration-300 group-hover:scale-[1.05]" unoptimized />
          </div>
        )}

        {/* legibility gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/25" />

        {/* Date badge */}
        <div className="absolute left-3 top-3 flex flex-col items-center rounded-xl bg-white/95 px-2.5 py-1 shadow-md ring-1 ring-black/5 backdrop-blur-sm dark:bg-bg-secondary/95">
          <span className="text-[10px] font-bold uppercase leading-none tracking-wide text-brand-600">{month}</span>
          <span className="text-lg font-black leading-tight text-fg-primary">{day}</span>
        </div>

        {/* Coin reward — the shimmering CoinPill badge */}
        {event.coin_reward > 0 && (
          <div className="absolute right-2.5 top-2.5">
            <CoinPill amount={event.coin_reward} size="sm" variant="gold" />
          </div>
        )}

        {/* Status badge — attended (green) takes precedence over registered (brand) */}
        {event.registration_status === 'ATTENDED' ? (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-success-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
            <CheckCircleIcon size={12} weight="fill" /> {t('events.attended') || 'Qatnashdingiz'}
          </div>
        ) : event.is_registered ? (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
            <CheckCircleIcon size={12} weight="fill" /> {t('events.registered')}
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-fg-primary">{event.title}</h3>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-fg-tertiary">
            <ClockIcon size={13} weight="fill" className="shrink-0 text-brand-500" />
            <span>{time}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 text-xs text-fg-tertiary">
              <MapPinIcon size={13} weight="fill" className="shrink-0 text-brand-500" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border-secondary pt-2.5">
          {organizer ? (
            <span className="truncate text-xs font-semibold text-brand-600">{organizer}</span>
          ) : <span />}
          <span className="flex shrink-0 items-center gap-1 text-xs text-fg-tertiary">
            <UsersThreeIcon size={13} className="shrink-0" />
            {event.registered_count}
            {event.participant_limit ? `/${event.participant_limit}` : ''}
          </span>
        </div>
      </div>
    </Link>
  );
});
