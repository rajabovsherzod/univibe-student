'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trophy, FunnelSimple } from '@phosphor-icons/react';
import { useLeaderboard, useMyLeaderboardEntry, type LeaderboardItem, type LeaderboardFilters } from '@/hooks/api/use-leaderboard';
import { useFaculties, useYearLevels, useStudentMe } from '@/hooks/api/use-profile';
import { CoinOutlineIcon } from '@/components/custom-icons/brand-icon';
import { CoinPill } from '@/components/student/CoinPill';
import { toHttps } from '@/utils/cx';
import { Select } from '@/components/base/select/select';
import { SelectItem } from '@/components/base/select/select-item';
import { useTranslation } from '@/lib/i18n/i18n';

// ── Helpers ─────────────────────────────────────────────────────────────

/** Faqat ism + familiya (otasining ismi kerak emas) */
function shortName(fullName: string): string {
  const parts = (fullName || '').trim().split(/\s+/);
  return parts.slice(0, 2).join(' ') || fullName;
}

// ── Skeletons ───────────────────────────────────────────────────────────

function PodiumSkeleton() {
  return (
    <div className="flex items-end justify-center gap-1.5 sm:gap-5 py-6 px-4 sm:px-2">
      {[100, 130, 80].map((h, i) => (
        <div key={i} className="flex flex-col items-center flex-1 max-w-[28vw] sm:max-w-[150px]">
          <div className="size-10 sm:size-16 rounded-full skeleton-shimmer mb-2" />
          <div className="h-3 w-12 rounded skeleton-shimmer mb-1.5" />
          <div className="h-5 w-12 rounded-full skeleton-shimmer mb-2" />
          <div className="w-full rounded-t-xl skeleton-shimmer" style={{ height: h }} />
        </div>
      ))}
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-border-secondary last:border-0">
      <td className="py-3 px-3"><div className="h-4 w-6 rounded skeleton-shimmer mx-auto" /></td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full skeleton-shimmer shrink-0" />
          <div className="h-4 w-28 rounded skeleton-shimmer" />
        </div>
      </td>
      <td className="py-3 px-3 hidden md:table-cell"><div className="h-3 w-24 rounded skeleton-shimmer" /></td>
      <td className="py-3 px-3 text-right"><div className="h-6 w-16 rounded-full skeleton-shimmer ml-auto" /></td>
    </tr>
  );
}

// ── Podium ──────────────────────────────────────────────────────────────

const PODIUM_CFG = {
  1: {
    standH: 'h-24 sm:h-32',
    standBg: 'bg-gradient-to-b from-amber-400 to-amber-500',
    numColor: 'text-amber-500',
    coinVariant: 'gold' as const,
  },
  2: {
    standH: 'h-16 sm:h-24',
    standBg: 'bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-600',
    numColor: 'text-gray-500 dark:text-gray-300',
    coinVariant: 'silver' as const,
  },
  3: {
    standH: 'h-12 sm:h-20',
    standBg: 'bg-gradient-to-b from-orange-400 to-orange-500',
    numColor: 'text-orange-500',
    coinVariant: 'bronze' as const,
  },
} as const;

function PodiumCard({ item, position }: { item: LeaderboardItem; position: 1 | 2 | 3 }) {
  const cfg = PODIUM_CFG[position];
  const name = shortName(item.full_name);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center flex-1 min-w-0 max-w-[28vw] sm:max-w-[150px] lg:max-w-[170px]">
      {/* Avatar */}
      <div className="size-10 sm:size-16 lg:size-20 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900 mb-1 sm:mb-1.5 shrink-0">
        {item.profile_photo ? (
          <Image src={toHttps(item.profile_photo)!} alt={name} width={80} height={80} className="size-full object-cover" unoptimized />
        ) : (
          <div className="size-full flex items-center justify-center text-sm sm:text-xl lg:text-2xl font-bold text-brand-600 dark:text-brand-400">{initial}</div>
        )}
      </div>

      {/* Name only */}
      <p className="text-[10px] sm:text-sm font-semibold text-fg-primary text-center truncate w-full px-0.5">{name}</p>

      {/* Coins */}
      <div className="mt-1 sm:mt-1.5">
        <CoinPill amount={item.total_coins} size="sm" variant={cfg.coinVariant} />
      </div>

      {/* Stand with large position number */}
      <div className={`mt-2 sm:mt-3 w-full ${cfg.standH} rounded-t-xl ${cfg.standBg} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-white/70 drop-shadow-sm">{position}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<LeaderboardFilters>({
    period_type: 'ALL_TIME',
    page_size: 20,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: profile } = useStudentMe();
  const universityId = profile?.university_public_id;
  const { data: faculties = [] } = useFaculties(universityId);
  const { data: yearLevels = [] } = useYearLevels(universityId);
  const { data, isPending } = useLeaderboard(filters);
  const { data: myEntry } = useMyLeaderboardEntry(filters);

  const results = data?.results || [];
  const top3 = results.slice(0, 3);
  const rest = results.slice(3);

  // Podium: [2nd, 1st, 3rd]
  const podiumOrder: { item: LeaderboardItem; pos: 1 | 2 | 3 }[] = [];
  if (top3[1]) podiumOrder.push({ item: top3[1], pos: 2 });
  if (top3[0]) podiumOrder.push({ item: top3[0], pos: 1 });
  if (top3[2]) podiumOrder.push({ item: top3[2], pos: 3 });

  const myId = profile?.user_public_id;

  // Check if current user is in the visible results (top 20)
  const meInResults = results.some(r => r.student_public_id === myId);

  return (
    <div className="space-y-4 pb-10">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-5 sm:p-6">
        <div className="absolute -right-4 -top-4 sm:-right-2 sm:-top-2 opacity-[0.06] pointer-events-none select-none">
          <Trophy size={140} weight="fill" className="text-brand-400 transform rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-fg-primary">{t('leaderboard.title')}</h1>
            <p className="text-fg-tertiary text-xs sm:text-sm mt-0.5">{t('leaderboard.subtitle')}</p>
          </div>

          {/* Desktop inline filters */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-36">
              <Select label="" placeholder={t('leaderboard.filterPeriod')} size="md"
                selectedKey={filters.period_type || null}
                onSelectionChange={(k) => setFilters(prev => ({ ...prev, period_type: k as LeaderboardFilters['period_type'] }))}
                items={[{ id: 'ALL_TIME', label: t('leaderboard.filterAllTime') }, { id: 'YEARLY', label: t('leaderboard.filterYearly') }]}
              >{(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}</Select>
            </div>

            <div className="w-40">
              <Select label="" placeholder={t('leaderboard.filterFaculty')} size="md"
                selectedKey={filters.faculty_public_id || null}
                onSelectionChange={(k) => setFilters(prev => ({ ...prev, faculty_public_id: k ? String(k) : undefined }))}
                items={faculties.map(f => ({ id: f.public_id, label: f.name }))}
              >{(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}</Select>
            </div>

            <div className="w-32">
              <Select label="" placeholder={t('leaderboard.filterYear')} size="md"
                selectedKey={filters.year_level_public_id || null}
                onSelectionChange={(k) => setFilters(prev => ({ ...prev, year_level_public_id: k ? String(k) : undefined }))}
                items={yearLevels.map(y => ({ id: y.public_id, label: y.name }))}
              >{(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}</Select>
            </div>
          </div>

          {/* Mobile filter toggle */}
          <button type="button" onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-1.5 text-xs font-medium text-fg-tertiary hover:text-fg-primary transition-colors py-1">
            <FunnelSimple size={14} weight="bold" />{t('leaderboard.filterButton')}
          </button>
        </div>

        {/* Mobile collapsible filters */}
        {showFilters && (
          <div className="mt-3 flex gap-2 sm:hidden">
            <div className="flex-1">
              <Select label="" placeholder={t('leaderboard.filterPeriod')} size="md"
                selectedKey={filters.period_type || null}
                onSelectionChange={(k) => setFilters(prev => ({ ...prev, period_type: k as LeaderboardFilters['period_type'] }))}
                items={[{ id: 'ALL_TIME', label: t('leaderboard.filterAll') }, { id: 'YEARLY', label: t('leaderboard.filterYearly') }]}
              >{(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}</Select>
            </div>

            <div className="flex-1">
              <Select label="" placeholder={t('leaderboard.filterFaculty')} size="md"
                selectedKey={filters.faculty_public_id || null}
                onSelectionChange={(k) => setFilters(prev => ({ ...prev, faculty_public_id: k ? String(k) : undefined }))}
                items={faculties.map(f => ({ id: f.public_id, label: f.name }))}
              >{(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}</Select>
            </div>
          </div>
        )}
      </div>

      {/* ── Main wrapper card ── */}
      <div className="rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm overflow-hidden">

        {/* Podium */}
        <div className="px-3 sm:px-6 pt-5 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} weight="fill" className="text-amber-500" />
            <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">{t('leaderboard.top3')}</p>
          </div>

          {isPending ? (
            <PodiumSkeleton />
          ) : podiumOrder.length > 0 ? (
            <div className="flex items-end justify-center gap-1.5 sm:gap-4 lg:gap-6 pb-2 px-4 sm:px-0">
              {podiumOrder.map(({ item, pos }, idx) => (
                <PodiumCard key={item.student_public_id || `p-${idx}`} item={item} position={pos} />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-fg-tertiary text-sm">{t('common.loading')}</p>
            </div>
          )}
        </div>

        <div className="border-t border-border-secondary" />

        {/* DataTable */}
        <div className="px-3 sm:px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <CoinOutlineIcon size={15} color="#f59e0b" strokeWidth={22} />
            <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">{t('leaderboard.title')}</p>
          </div>

          <div className="overflow-x-auto -mx-3 sm:-mx-6">
            <table className="w-full min-w-[380px]">
              <thead>
                <tr className="border-b-2 border-border-secondary">
                  <th className="text-left text-[11px] font-bold text-fg-tertiary uppercase tracking-wider py-2.5 px-3 sm:px-4 w-12">#</th>
                  <th className="text-left text-[11px] font-bold text-fg-tertiary uppercase tracking-wider py-2.5 px-3 sm:px-4">{t('leaderboard.name')}</th>
                  <th className="text-left text-[11px] font-bold text-fg-tertiary uppercase tracking-wider py-2.5 px-3 sm:px-4 hidden md:table-cell">{t('profile.faculty')}</th>
                  <th className="text-right text-[11px] font-bold text-fg-tertiary uppercase tracking-wider py-2.5 px-3 sm:px-4 w-28">{t('leaderboard.coins')}</th>
                </tr>
              </thead>
              <tbody>
                {isPending ? (
                  Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : rest.length > 0 ? (
                  rest.map((item, idx) => {
                    const isMe = myId === item.student_public_id;
                    const name = shortName(item.full_name);
                    const initial = name.charAt(0).toUpperCase();
                    return (
                      <tr
                        key={item.student_public_id || `r-${idx}`}
                        className={[
                          'border-b border-border-secondary last:border-0 transition-colors',
                          isMe ? 'bg-brand-50/60 dark:bg-brand-950/30' : 'hover:bg-bg-primary/50',
                        ].join(' ')}
                      >
                        <td className="py-3 px-3 sm:px-4">
                          <span className={`text-sm font-bold tabular-nums ${isMe ? 'text-brand-600 dark:text-brand-400' : 'text-fg-quaternary'}`}>
                            {item.rank ?? (idx + 4)}
                          </span>
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 sm:size-9 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900 shrink-0">
                              {item.profile_photo ? (
                                <Image src={toHttps(item.profile_photo)!} alt="" width={36} height={36} className="size-full object-cover" unoptimized />
                              ) : (
                                <div className="size-full flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400">{initial}</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-sm font-semibold truncate ${isMe ? 'text-brand-700 dark:text-brand-300' : 'text-fg-primary'}`}>
                                {name}
                                {isMe && <span className="text-[10px] text-fg-tertiary ml-1">({t('leaderboard.myRank')})</span>}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4 hidden md:table-cell">
                          <p className="text-xs text-fg-tertiary truncate max-w-[200px]">{item.faculty || '—'}</p>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right">
                          <CoinPill amount={item.total_coins} size="sm" variant="primary" />
                        </td>
                      </tr>
                    );
                  })
                ) : results.length > 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-fg-tertiary text-sm">
                      Faqat podyumdagi talabalar mavjud
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── My Rank Card (outside top 20) ── */}
      {myEntry && myEntry.rank && !meInResults && (
        <div className="rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900 shrink-0">
              {myEntry.profile_photo ? (
                <Image src={toHttps(myEntry.profile_photo)!} alt="" width={40} height={40} className="size-full object-cover" unoptimized />
              ) : (
                <div className="size-full flex items-center justify-center text-sm font-bold text-brand-600 dark:text-brand-400">
                  {shortName(myEntry.full_name).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-700 dark:text-brand-300 truncate">
                {shortName(myEntry.full_name)} <span className="text-[10px] text-fg-tertiary">({t('leaderboard.myRank')})</span>
              </p>
              <p className="text-xs text-fg-tertiary">{t('leaderboard.rank')}: #{myEntry.rank}</p>
            </div>
            <CoinPill amount={myEntry.total_coins} size="sm" variant="primary" />
          </div>
        </div>
      )}
    </div>
  );
}
