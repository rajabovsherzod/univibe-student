'use client';

import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { cx } from '@/utils/cx';
import { useTranslation } from '@/lib/i18n/i18n';

interface LeaderboardPaginationProps {
  page: number;
  total: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function LeaderboardPagination({
  page,
  total,
  totalItems,
  pageSize,
  onPageChange,
}: LeaderboardPaginationProps) {
  const { t } = useTranslation();

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const canGoPrev = page > 1;
  const canGoNext = page < total;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-border-secondary">
      {/* Range info */}
      <div className="text-xs sm:text-sm text-fg-tertiary">
        {start}-{end} / {totalItems}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => canGoPrev && onPageChange(page - 1)}
          disabled={!canGoPrev}
          className={cx(
            'flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors',
            canGoPrev
              ? 'bg-bg-primary hover:bg-bg-tertiary text-fg-primary'
              : 'bg-bg-tertiary text-fg-tertiary cursor-not-allowed'
          )}
        >
          <CaretLeft size={16} weight="bold" />
          <span className="hidden sm:inline">{t('leaderboard.pagination.previous')}</span>
        </button>

        <span className="text-xs sm:text-sm text-fg-secondary">
          {t('leaderboard.pagination.page')} <span className="font-semibold">{page}</span> {t('leaderboard.pagination.of')}{' '}
          <span className="font-semibold">{total}</span>
        </span>

        <button
          onClick={() => canGoNext && onPageChange(page + 1)}
          disabled={!canGoNext}
          className={cx(
            'flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors',
            canGoNext
              ? 'bg-bg-primary hover:bg-bg-tertiary text-fg-primary'
              : 'bg-bg-tertiary text-fg-tertiary cursor-not-allowed'
          )}
        >
          <span className="hidden sm:inline">{t('leaderboard.pagination.next')}</span>
          <CaretRight size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}
