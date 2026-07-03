'use client';

import { useMemo, useState } from 'react';
import { MagnifyingGlassIcon, CalendarDotsIcon, CalendarBlankIcon } from '@phosphor-icons/react';
import { useEvents } from '@/hooks/api/use-events';
import { EventListCard, EventCardSkeleton } from '@/components/student/EventListCard';
import { useTranslation } from '@/lib/i18n/i18n';

export default function EventsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  // Fetch once, filter on the client — the backend list ignores ?search, and
  // per-university event counts are small, so this is instant and avoids a
  // network round-trip on every keystroke.
  const { data: allEvents = [], isPending } = useEvents();
  const events = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allEvents;
    return allEvents.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      (e.location || '').toLowerCase().includes(q) ||
      (e.organizer_club_name || '').toLowerCase().includes(q) ||
      (e.organizer_staff_name || '').toLowerCase().includes(q),
    );
  }, [allEvents, search]);

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-5 sm:p-6">
        <div className="absolute -right-4 -top-4 opacity-[0.06] pointer-events-none select-none">
          <CalendarDotsIcon size={140} weight="fill" className="text-brand-400 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-fg-primary">{t('events.title') || 'Tadbirlar'}</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-fg-tertiary">
              {t('events.subtitle') || "Universitetdagi tadbirlarni ko'ring va ro'yxatdan o'ting"}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-quaternary" />
            <input
              type="text"
              placeholder={t('events.searchPlaceholder') || 'Tadbir qidirish...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-border-secondary bg-bg-primary pl-9 pr-4 text-sm text-fg-primary placeholder-fg-quaternary outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {isPending ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {events.map((e) => <EventListCard key={e.public_id} event={e} />)}
        </div>
      ) : (
        <div className="rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm py-16 text-center">
          <CalendarBlankIcon size={48} weight="light" className="mx-auto mb-4 text-fg-quaternary" />
          <h3 className="mb-1 text-base font-semibold text-fg-primary">{t('events.emptyTitle') || 'Hozircha tadbirlar yo\'q'}</h3>
          <p className="mx-auto max-w-md text-sm text-fg-tertiary">
            {t('events.emptyDescription') || "Yangi tadbirlar qo'shilishi bilan shu yerda ko'rinadi."}
          </p>
        </div>
      )}
    </div>
  );
}
