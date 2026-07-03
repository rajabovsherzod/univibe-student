'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trophy, FunnelSimple } from '@phosphor-icons/react';
import { useLeaderboard, useMyLeaderboardEntry, type LeaderboardItem, type LeaderboardFilters } from '@/hooks/api/use-leaderboard';
import { useFaculties, useYearLevels, useStudentMe } from '@/hooks/api/use-profile';
import { CoinOutlineIcon } from '@/components/custom-icons/brand-icon';
import { CoinPill } from '@/components/student/CoinPill';
import { LeaderboardPagination } from '@/components/student/LeaderboardPagination';
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

function PodiumWithTableSkeleton() {
  return (
    <>
      <PodiumSkeleton />
      <div className="border-t border-border-secondary" />
      <div className="px-3 sm:px-6 py-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 rounded skeleton-shimmer" />
          <div className="h-3 w-20 rounded skeleton-shimmer" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-border-secondary">
              <th className="text-left py-2.5 px-2 sm:px-4 w-10 sm:w-12"><div className="h-3 w-5 rounded skeleton-shimmer" /></th>
              <th className="text-left py-2.5 px-2 sm:px-4"><div className="h-3 w-20 rounded skeleton-shimmer" /></th>
              <th className="text-left py-2.5 px-2 sm:px-4 hidden md:table-cell"><div className="h-3 w-24 rounded skeleton-shimmer" /></th>
              <th className="text-right py-2.5 px-2 sm:px-4 w-20 sm:w-28"><div className="h-3 w-16 rounded skeleton-shimmer ml-auto" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 17 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TableOnlySkeleton() {
  return (
    <div className="px-3 sm:px-6 py-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 w-4 rounded skeleton-shimmer" />
        <div className="h-3 w-20 rounded skeleton-shimmer" />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-border-secondary">
            <th className="text-left py-2.5 px-2 sm:px-4 w-10 sm:w-12"><div className="h-3 w-5 rounded skeleton-shimmer" /></th>
            <th className="text-left py-2.5 px-2 sm:px-4"><div className="h-3 w-20 rounded skeleton-shimmer" /></th>
            <th className="text-left py-2.5 px-2 sm:px-4 hidden md:table-cell"><div className="h-3 w-24 rounded skeleton-shimmer" /></th>
            <th className="text-right py-2.5 px-2 sm:px-4 w-20 sm:w-28"><div className="h-3 w-16 rounded skeleton-shimmer ml-auto" /></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-border-secondary last:border-0">
      <td className="py-3 px-2 sm:px-3"><div className="h-4 w-5 rounded skeleton-shimmer mx-auto" /></td>
      <td className="py-3 px-2 sm:px-3">
        <div className="flex items-center gap-2">
          <div className="size-7 sm:size-8 rounded-full skeleton-shimmer shrink-0" />
          <div className="h-4 w-24 sm:w-28 rounded skeleton-shimmer" />
        </div>
      </td>
      <td className="py-3 px-2 sm:px-3 hidden md:table-cell"><div className="h-3 w-24 rounded skeleton-shimmer" /></td>
      <td className="py-3 px-2 sm:px-3 text-right"><div className="h-6 w-14 sm:w-16 rounded-full skeleton-shimmer ml-auto" /></td>
    </tr>
  );
}

// ── Podium ──────────────────────────────────────────────────────────────

const PODIUM_CFG = {
  1: {
    standH: 'h-28 sm:h-36',
    cap: 'bg-gradient-to-b from-amber-200 to-amber-400',
    face: 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600',
    ring: 'ring-amber-600/40',
    line: 'bg-amber-100/50',
    coinVariant: 'gold' as const,
  },
  2: {
    standH: 'h-20 sm:h-28',
    cap: 'bg-gradient-to-b from-slate-200 to-slate-400 dark:from-slate-300 dark:to-slate-500',
    face: 'bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 dark:from-slate-400 dark:via-slate-500 dark:to-slate-600',
    ring: 'ring-slate-500/40',
    line: 'bg-white/45',
    coinVariant: 'silver' as const,
  },
  3: {
    standH: 'h-14 sm:h-24',
    cap: 'bg-gradient-to-b from-orange-200 to-orange-400',
    face: 'bg-gradient-to-b from-orange-400 via-orange-500 to-orange-700',
    ring: 'ring-orange-700/40',
    line: 'bg-orange-100/50',
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

      {/* 3D podium block: a top cap surface + a beveled front face */}
      <div className={`mt-2 sm:mt-3 flex w-full flex-col ${cfg.standH}`}>
        {/* Top surface (the step the winner stands on) */}
        <div className={`h-2.5 sm:h-3 shrink-0 rounded-t-lg ${cfg.cap} ring-1 ${cfg.ring}`} />

        {/* Front face */}
        <div className={`relative flex-1 overflow-hidden rounded-b-md ${cfg.face} shadow-lg ring-1 ${cfg.ring}`}>
          {/* left bevel highlight */}
          <div className="absolute inset-y-0 left-0 w-2 bg-white/25 sm:w-2.5" />
          {/* right bevel shadow */}
          <div className="absolute inset-y-0 right-0 w-2 bg-black/15 sm:w-2.5" />
          {/* top sheen */}
          <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/25 to-transparent" />
          {/* position number flanked by groove lines — the lines run up to the
              number and continue after it, without ever cutting across it */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 px-3 sm:gap-3 sm:px-4">
            <span className={`h-px flex-1 ${cfg.line}`} />
            <span className="text-3xl font-black text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)] sm:text-5xl lg:text-6xl">
              {position}
            </span>
            <span className={`h-px flex-1 ${cfg.line}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { t } = useTranslation();
  
  // Get current academic year intelligently
  // If month is September (8) to December (11) → return current year
  // If month is January (0) to August (7) → return previous year
  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11 (January-August)
    
    // Academic year: Sept 2024 - Aug 2025 → returns 2024
    if (month >= 8) { // September to December
      return year;
    } else { // January to August
      return year - 1;
    }
  };

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<LeaderboardFilters>({
    period_type: 'ALL_TIME',
    page_size: 20,
    page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const { data: profile } = useStudentMe();
  const universityId = profile?.university_public_id;
  const { data: faculties = [] } = useFaculties(universityId);
  const { data: yearLevels = [] } = useYearLevels(universityId);
  const { data, isPending } = useLeaderboard(filters);
  const { data: myEntry } = useMyLeaderboardEntry(filters);

  // Update filters when page changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, page }));
  }, [page]);

  const results = data?.results || [];
  const totalItems = data?.pagination?.total_items || 0;
  const pageSize = data?.pagination?.page_size || 20;
  const myId = profile?.user_public_id;

  // Backend sends paginated data (20 per page)
  // Page 1: Split into podium (top 3) + table (remaining 17)
  // Page 2+: Show all 20 in table
  const isPage1 = page === 1;
  const top3 = isPage1 ? results.slice(0, 3) : [];
  // Table shows ALL results including top-3
  const rest = results;

  // Podium: [2nd, 1st, 3rd] - only on page 1
  const podiumOrder: { item: LeaderboardItem; pos: 1 | 2 | 3 }[] = [];
  if (isPage1) {
    if (top3[1]) podiumOrder.push({ item: top3[1], pos: 2 });
    if (top3[0]) podiumOrder.push({ item: top3[0], pos: 1 });
    if (top3[2]) podiumOrder.push({ item: top3[2], pos: 3 });
  }

  // Check if current user is in the visible results
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
              <Select aria-label={t('leaderboard.filterPeriod')} placeholder={t('leaderboard.filterPeriod')} size="md"
                selectedKey={filters.period_type || null}
                onSelectionChange={(k) => {
                  const newPeriodType = k as LeaderboardFilters['period_type'];
                  const newFilters: LeaderboardFilters = { ...filters, period_type: newPeriodType };
                  
                  if (newPeriodType === 'YEARLY') {
                    // Auto-set current year when switching to YEARLY
                    if (!selectedYear) {
                      const year = getCurrentAcademicYear();
                      newFilters.period_year = year;
                      setSelectedYear(year);
                    } else {
                      newFilters.period_year = selectedYear;
                    }
                  } else {
                    // Clear period_year when switching to ALL_TIME
                    newFilters.period_year = undefined;
                  }
                  
                  setFilters(newFilters);
                }}
                items={[{ id: 'ALL_TIME', label: t('leaderboard.filterAllTime') }, { id: 'YEARLY', label: t('leaderboard.filterYearly') }]}
              >{(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}</Select>
            </div>

            <div className="w-40">
              <Select aria-label={t('leaderboard.filterFaculty')} placeholder={t('leaderboard.filterFaculty')} size="md"
                selectedKey={filters.faculty_public_id || null}
                onSelectionChange={(k) => setFilters(prev => ({ ...prev, faculty_public_id: k ? String(k) : undefined }))}
                items={faculties.map(f => ({ id: f.public_id, label: f.name }))}
              >{(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}</Select>
            </div>

            <div className="w-32">
              <Select aria-label={t('leaderboard.filterYear')} placeholder={t('leaderboard.filterYear')} size="md"
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
              <Select aria-label={t('leaderboard.filterPeriod')} placeholder={t('leaderboard.filterPeriod')} size="md"
                selectedKey={filters.period_type || null}
                onSelectionChange={(k) => {
                  const newPeriodType = k as LeaderboardFilters['period_type'];
                  const newFilters: LeaderboardFilters = { ...filters, period_type: newPeriodType };
                  
                  if (newPeriodType === 'YEARLY') {
                    // Auto-set current year when switching to YEARLY
                    if (!selectedYear) {
                      const year = getCurrentAcademicYear();
                      newFilters.period_year = year;
                      setSelectedYear(year);
                    } else {
                      newFilters.period_year = selectedYear;
                    }
                  } else {
                    // Clear period_year when switching to ALL_TIME
                    newFilters.period_year = undefined;
                  }
                  
                  setFilters(newFilters);
                }}
                items={[{ id: 'ALL_TIME', label: t('leaderboard.filterAll') }, { id: 'YEARLY', label: t('leaderboard.filterYearly') }]}
              >{(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}</Select>
            </div>

            <div className="flex-1">
              <Select aria-label={t('leaderboard.filterFaculty')} placeholder={t('leaderboard.filterFaculty')} size="md"
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
        {isPending ? (
          // Loading skeleton - different for page 1 vs page 2+
          isPage1 ? (
            <PodiumWithTableSkeleton />
          ) : (
            <TableOnlySkeleton />
          )
        ) : (
          <>
            {/* Podium - only on page 1 */}
            {isPage1 && podiumOrder.length > 0 && (
              <div className="px-3 sm:px-6 pt-5 pb-2">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={16} weight="fill" className="text-amber-500" />
                  <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">{t('leaderboard.top3')}</p>
                </div>
                <div className="flex items-end justify-center gap-1 sm:gap-1.5 lg:gap-2 pb-2 px-4 sm:px-0">
                  {podiumOrder.map(({ item, pos }, idx) => (
                    <PodiumCard key={item.student_public_id || `p-${idx}`} item={item} position={pos} />
                  ))}
                </div>
              </div>
            )}

            {isPage1 && <div className="border-t border-border-secondary" />}

            {/* DataTable */}
            <div className="px-3 sm:px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <CoinOutlineIcon size={15} color="#f59e0b" strokeWidth={22} />
                <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">{t('leaderboard.title')}</p>
              </div>

              <div className="overflow-x-hidden">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b-2 border-border-secondary">
                      <th className="text-center text-[11px] font-bold text-fg-tertiary uppercase tracking-wider py-2.5 px-1.5 sm:px-4 w-14 sm:w-16">#</th>
                      <th className="text-left text-[11px] font-bold text-fg-tertiary uppercase tracking-wider py-2.5 px-1.5 sm:px-4">{t('leaderboard.name')}</th>
                      <th className="text-left text-[11px] font-bold text-fg-tertiary uppercase tracking-wider py-2.5 px-2 sm:px-4 hidden md:table-cell">{t('profile.faculty')}</th>
                      <th className="text-right text-[11px] font-bold text-fg-tertiary uppercase tracking-wider py-2.5 px-1.5 sm:px-4 w-28 sm:w-28">{t('leaderboard.coins')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.length > 0 ? (
                      rest.map((item, idx) => {
                        const isMe = myId === item.student_public_id;
                        const name = shortName(item.full_name);
                        const initial = name.charAt(0).toUpperCase();
                        // Kichik ekranlarda joy tejash uchun ism va familiyani ikki
                        // qatorga bo'lamiz (ism tepada, familiya pastda).
                        const [firstName, ...restName] = name.split(' ');
                        const lastName = restName.join(' ');
                        const rank = item.rank ?? (idx + (isPage1 ? 1 : (page - 1) * pageSize + idx + 1));
                        const placeImages: Record<1|2|3, string> = { 1: '/places/1st-place.png', 2: '/places/2nd-place.png', 3: '/places/3rd-place.png' };
                        const placeImg = rank <= 3 ? placeImages[rank as 1|2|3] : null;

                        return (
                          <tr
                            key={item.student_public_id || `r-${idx}`}
                            className={[
                              'border-b border-border-secondary last:border-0 transition-colors',
                              isMe ? 'bg-brand-50/60 dark:bg-brand-950/30' : 'hover:bg-bg-primary/50',
                            ].join(' ')}
                          >
                            {/* Rank ustuni — 1/2/3 uchun place rasm, boshqalar uchun raqam.
                                Rasm ham raqam ham '#' bilan bir vertikal o'qda (markazda). */}
                            <td className="py-3 px-1.5 sm:px-4 text-center">
                              {placeImg ? (
                                <Image
                                  src={placeImg}
                                  alt={`${rank}-o'rin`}
                                  width={48}
                                  height={48}
                                  className="mx-auto block size-9 max-w-none object-contain drop-shadow-sm"
                                  unoptimized
                                />
                              ) : isMe ? (
                                // Bu — joriy foydalanuvchi qatori: raqamni brand pill + halqa
                                // bilan belgilaymiz (alohida "mening o'rnim" yozuvi shart emas).
                                <span
                                  title={t('leaderboard.myRank')}
                                  className="inline-flex min-w-[1.35rem] items-center justify-center rounded-full bg-brand-600 px-1 py-0.5 text-[11px] sm:text-xs font-bold tabular-nums text-white shadow-sm ring-2 ring-brand-200 dark:ring-brand-900"
                                >
                                  {rank}
                                </span>
                              ) : (
                                <span className="text-xs sm:text-sm font-bold tabular-nums text-fg-quaternary">
                                  {rank}
                                </span>
                              )}
                            </td>

                            {/* Ism ustuni — ism tepada, familiya pastda (2 qator) */}
                            <td className="py-3 px-1.5 sm:px-4">
                              <div className="flex items-center gap-2">
                                <div className="size-7 sm:size-9 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900 shrink-0">
                                  {item.profile_photo ? (
                                    <Image src={toHttps(item.profile_photo)!} alt="" width={36} height={36} className="size-full object-cover" unoptimized />
                                  ) : (
                                    <div className="size-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-brand-600 dark:text-brand-400">{initial}</div>
                                  )}
                                </div>
                                <div className={`min-w-0 leading-tight ${isMe ? 'text-brand-700 dark:text-brand-300' : 'text-fg-primary'}`}>
                                  <p className="text-xs sm:text-sm font-semibold truncate">{firstName}</p>
                                  {lastName && <p className="text-xs sm:text-sm font-semibold truncate">{lastName}</p>}
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-2 sm:px-4 hidden md:table-cell">
                              <p className="text-xs text-fg-tertiary truncate max-w-[200px]">{item.faculty || '—'}</p>
                            </td>
                            <td className="py-3 px-1.5 sm:px-4 text-right">
                              <CoinPill
                                amount={item.total_coins}
                                size="sm"
                                variant={placeImg ? (['gold', 'silver', 'bronze'] as const)[rank - 1] : 'primary'}
                              />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-fg-tertiary text-sm">
                          {isPage1 ? 'Faqat podyumdagi talabalar mavjud' : 'Bu sahifada talabalar yo\'q'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── Pagination ── */}
        {data?.pagination && (
          <LeaderboardPagination
            page={page}
            total={data.pagination.total_pages}
            totalItems={data.pagination.total_items}
            pageSize={data.pagination.page_size}
            onPageChange={setPage}
          />
        )}
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
