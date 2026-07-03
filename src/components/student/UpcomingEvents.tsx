'use client';

import Link from 'next/link';
import { CalendarDotsIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useEvents } from '@/hooks/api/use-events';
import { EventListCard, EventCardSkeleton } from '@/components/student/EventListCard';
import { useTranslation } from '@/lib/i18n/i18n';

export function UpcomingEvents() {
  const { t } = useTranslation();
  const { data: events = [], isPending } = useEvents();

  const now = Date.now();
  const upcoming = events
    .filter((e) => new Date(e.end_time || e.start_time).getTime() >= now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 8);

  // Nothing to show → hide the section entirely (keeps the dashboard clean).
  if (!isPending && upcoming.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDotsIcon size={18} weight="fill" className="text-brand-600" />
          <h2 className="text-base font-bold text-fg-primary sm:text-lg">{t('events.upcoming') || 'Yaqin tadbirlar'}</h2>
        </div>
        <Link href="/events" className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700">
          {t('events.seeAll') || 'Barchasi'} <CaretRightIcon size={14} weight="bold" />
        </Link>
      </div>

      {/* Horizontal snap carousel */}
      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4">
        {isPending
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-64 shrink-0 snap-start sm:w-72"><EventCardSkeleton /></div>
            ))
          : upcoming.map((e) => (
              <div key={e.public_id} className="w-64 shrink-0 snap-start sm:w-72"><EventListCard event={e} /></div>
            ))}
      </div>
    </section>
  );
}
