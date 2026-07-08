'use client';

import { memo, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MagnifyingGlassIcon, UsersThreeIcon, HeartIcon, UsersFourIcon,
} from '@phosphor-icons/react';
import { useClubs, clubCategoryName, type Club } from '@/hooks/api/use-clubs';
import { useTranslation } from '@/lib/i18n/i18n';
import { toHttps } from '@/utils/cx';

function ClubCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-secondary bg-bg-secondary shadow-sm overflow-hidden">
      <div className="aspect-[5/2] skeleton-shimmer" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-4 w-2/3 rounded skeleton-shimmer" />
        <div className="h-3 w-1/3 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}

const ClubCard = memo(function ClubCard({ club }: { club: Club }) {
  const { t } = useTranslation();
  const banner = toHttps(club.banner);
  const logo = toHttps(club.logo);
  const category = clubCategoryName(club.category);

  return (
    <Link
      href={`/clubs/${club.public_id}`}
      className="group rounded-2xl border border-border-secondary bg-bg-secondary shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-border-brand flex flex-col"
    >
      {/* Banner */}
      <div className="relative aspect-[5/2] bg-bg-tertiary overflow-hidden shrink-0">
        {banner ? (
          <Image src={banner} alt={club.name} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
        ) : (
          <div className="size-full bg-gradient-to-br from-brand-500/20 to-brand-700/10" />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="relative z-10 -mt-8 size-14 shrink-0 overflow-hidden rounded-2xl bg-bg-secondary ring-4 ring-bg-secondary shadow-sm">
            {logo ? (
              <Image src={logo} alt={club.name} width={56} height={56} className="size-full object-cover" unoptimized />
            ) : (
              <div className="flex size-full items-center justify-center bg-brand-600 text-lg font-bold text-white">
                {(club.name || 'C').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="truncate text-sm font-semibold text-fg-primary">{club.name}</h3>
            {category && <p className="truncate text-xs text-brand-600">{category}</p>}
          </div>
        </div>

        {club.short_description && (
          <p className="mt-2 line-clamp-2 text-xs text-fg-tertiary">{club.short_description}</p>
        )}

        <div className="mt-auto flex items-center gap-4 pt-3 text-xs text-fg-tertiary">
          <span className="flex items-center gap-1.5">
            <UsersThreeIcon size={13} className="shrink-0" /> {club.members_count} {t('clubs.members')}
          </span>
          <span className="flex items-center gap-1.5">
            <HeartIcon size={13} className="shrink-0" /> {club.followers_count} {t('clubs.followers')}
          </span>
        </div>
      </div>
    </Link>
  );
});

export default function ClubsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  // Fetch once, filter on the client → instant search, no refetch per keystroke.
  const { data: allClubs = [], isPending } = useClubs();
  const clubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allClubs;
    return allClubs.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.short_description || '').toLowerCase().includes(q) ||
      (clubCategoryName(c.category) || '').toLowerCase().includes(q),
    );
  }, [allClubs, search]);

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-5 sm:p-6">
        <div className="absolute -right-4 -top-4 opacity-[0.06] pointer-events-none select-none">
          <UsersFourIcon size={140} weight="fill" className="text-brand-400 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-fg-primary">{t('clubs.title') || 'Klublar'}</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-fg-tertiary">
              {t('clubs.subtitle') || "Universitet klublarini kashf eting va obuna bo'ling"}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-quaternary" />
            <input
              type="text"
              placeholder={t('clubs.searchPlaceholder') || 'Klub qidirish...'}
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
          {Array.from({ length: 6 }).map((_, i) => <ClubCardSkeleton key={i} />)}
        </div>
      ) : clubs.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {clubs.map((c) => <ClubCard key={c.public_id} club={c} />)}
        </div>
      ) : (
        <div className="rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm py-16 text-center">
          <UsersFourIcon size={48} weight="light" className="mx-auto mb-4 text-fg-quaternary" />
          <h3 className="mb-1 text-base font-semibold text-fg-primary">{t('clubs.emptyTitle') || 'Hozircha klublar yo\'q'}</h3>
          <p className="mx-auto max-w-md text-sm text-fg-tertiary">
            {t('clubs.emptyDescription') || "Yangi klublar qo'shilishi bilan shu yerda ko'rinadi."}
          </p>
        </div>
      )}
    </div>
  );
}
