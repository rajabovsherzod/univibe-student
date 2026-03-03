'use client';

import { useState } from 'react';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CalendarBlankIcon,
  TrophyIcon,
  GiftIcon,
  ShoppingBagIcon,
  CaretLeftIcon,
  CaretRightIcon,
  SparkleIcon,
  WalletIcon,
} from '@phosphor-icons/react';
import { useTranslation } from '@/lib/i18n/i18n';
import { useBalance, useTransactions, type CoinTransaction } from '@/hooks/api/use-wallet';
import { CoinPill } from '@/components/student/CoinPill';
import { CoinOutlineIcon } from '@/components/custom-icons/brand-icon';

const PAGE_SIZE = 20;

// ── Helpers ──────────────────────────────────────────────────────────────────

function groupByDate(transactions: CoinTransaction[]) {
  const groups: Record<string, CoinTransaction[]> = {};
  for (const tx of transactions) {
    const d = new Date(tx.created_at);
    const key = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }
  return Object.entries(groups);
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  const date = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

function getTxIcon(tx: CoinTransaction, isEarned: boolean) {
  const rule = (tx.coin_rule_name || '').toLowerCase();

  if (isEarned) {
    if (rule.includes('tadbir') || rule.includes('event')) return CalendarBlankIcon;
    if (rule.includes('yutuq') || rule.includes('achieve') || rule.includes('trophy')) return TrophyIcon;
    if (rule.includes('bonus') || rule.includes('mukofot') || rule.includes('gift')) return GiftIcon;
    return ArrowDownLeftIcon;
  }

  if (tx.transaction_type !== 'ISSUANCE') return ShoppingBagIcon;
  return ArrowUpRightIcon;
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function TxSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-secondary last:border-0">
      <div className="size-11 rounded-full skeleton-shimmer shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 rounded skeleton-shimmer" />
        <div className="h-3 w-1/3 rounded skeleton-shimmer" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="h-4 w-20 rounded skeleton-shimmer" />
        <div className="h-3 w-10 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}

// ── Transaction Row ───────────────────────────────────────────────────────────

function TransactionRow({ tx, t }: { tx: CoinTransaction, t: any }) {
  const isEarned = tx.transaction_type === 'ISSUANCE';
  const Icon = getTxIcon(tx, isEarned);
  const label = tx.coin_rule_name || (isEarned ? t('balance.coinEarned') : t('balance.coinSpent'));
  const sublabel = tx.comment || tx.staff_member_name;

  return (
    <div className="flex items-center gap-3 sm:gap-4 px-4 py-3.5 hover:bg-bg-tertiary transition-colors border-b border-border-secondary last:border-0">
      <div className={`shrink-0 flex items-center justify-center size-10 rounded-full bg-white dark:bg-bg-tertiary border border-border-secondary shadow-sm`}>
        <Icon size={18} weight="bold" className={isEarned ? 'text-success-600 dark:text-success-400' : 'text-fg-tertiary'} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-fg-primary truncate">{label}</p>
        {sublabel && (
          <p className="text-xs text-fg-tertiary mt-0.5 truncate">{sublabel}</p>
        )}
      </div>

      <div className="shrink-0 text-right">
        <div className={`flex items-center justify-end gap-1 text-sm font-bold tabular-nums ${isEarned ? 'text-success-600 dark:text-success-400' : 'text-fg-primary'
          }`}>
          <span>{isEarned ? '+' : '−'}{tx.amount.toLocaleString()}</span>
          <CoinOutlineIcon size={13} color="currentColor" strokeWidth={24} />
        </div>
        <p className="text-[11px] text-fg-quaternary mt-1">{formatTime(tx.created_at)}</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BalancePage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data: balance, isPending: balanceLoading } = useBalance();
  const { data: txData, isPending: txLoading } = useTransactions({ page, page_size: PAGE_SIZE });

  const transactions = txData?.results ?? [];
  const totalCount = txData?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const grouped = groupByDate(transactions);

  return (
    <div className="space-y-4 pb-10">

      {/* ── Hero Balance Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-5 sm:p-6">
        {/* Decorative icon */}
        <div className="absolute -right-4 -top-4 opacity-[0.05] pointer-events-none select-none">
          <WalletIcon size={160} weight="fill" className="text-brand-400 transform -rotate-12" />
        </div>

        <div className="relative z-10">
          {/* Label pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/15 border border-brand-100 dark:border-brand-800/30 mb-4">
            <SparkleIcon size={11} weight="fill" className="text-brand-600 dark:text-brand-400" />
            <span className="text-[11px] font-bold text-brand-700 dark:text-brand-400 uppercase tracking-widest">
              {t('balance.currentBalance')}
            </span>
          </div>

          {/* Balance + stats row */}
          <div>
            {balanceLoading ? (
              <div className="h-10 w-28 rounded-xl skeleton-shimmer bg-bg-tertiary" />
            ) : (
              <CoinPill amount={balance?.total_balance ?? 0} size="lg" variant="gold" />
            )}
            <div className="mt-3 space-y-0.5">
              {balanceLoading ? (
                <>
                  <div className="h-4 w-32 rounded skeleton-shimmer bg-bg-tertiary mb-1" />
                  <div className="h-4 w-48 rounded skeleton-shimmer bg-bg-tertiary" />
                </>
              ) : (
                <>
                  {balance?.university_name && (
                    <p className="text-xs font-semibold text-fg-secondary">{balance.university_name}</p>
                  )}
                  {balance?.last_transaction_at ? (
                    <p className="text-xs text-fg-tertiary">
                      {t('balance.lastTransaction')}: {formatDateShort(balance.last_transaction_at)}
                    </p>
                  ) : (
                    <p className="text-xs text-fg-quaternary">{t('balance.noTransactionsYet')}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Motivational bar */}
          <div className="mt-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800/20">
            <SparkleIcon size={13} weight="fill" className="text-brand-500 dark:text-brand-400 shrink-0" />
            <p className="text-xs font-medium text-brand-700 dark:text-brand-400 leading-snug">
              {t('balance.motivational')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Transaction History ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[15px] font-bold text-fg-primary">{t('balance.transactionHistory')}</h2>
          {totalCount > 0 && !txLoading && (
            <span className="text-xs text-white bg-brand-500 px-2.5 py-1 rounded-full font-medium">
              {totalCount} {t('balance.totalCount')}
            </span>
          )}
        </div>

        {/* Loading */}
        {(!txData || txLoading) && (
          <div className="bg-bg-secondary rounded-2xl border border-border-secondary shadow-sm overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => <TxSkeleton key={i} />)}
          </div>
        )}

        {/* Empty */}
        {txData && !txLoading && grouped.length === 0 && (
          <div className="rounded-2xl bg-bg-secondary border border-border-secondary py-16 text-center shadow-sm">
            <div className="flex items-center justify-center size-14 rounded-2xl bg-bg-tertiary mx-auto mb-3">
              <CoinOutlineIcon size={28} color="currentColor" strokeWidth={18} className="text-fg-quaternary" />
            </div>
            <p className="text-sm font-semibold text-fg-secondary">{t('balance.noTransactions')}</p>
            <p className="text-xs text-fg-tertiary mt-1">{t('balance.noTransactionsDesc')}</p>
          </div>
        )}

        {/* Grouped list */}
        {txData && !txLoading && grouped.length > 0 && (
          <>
            {grouped.map(([date, txns]) => (
              <div key={date}>
                <p className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-widest mb-2 px-1">
                  {date}
                </p>
                <div className="bg-bg-secondary rounded-2xl border border-border-secondary shadow-sm overflow-hidden">
                  {txns.map((tx) => (
                    <TransactionRow key={tx.transaction_public_id} tx={tx} t={t} />
                  ))}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-fg-secondary border border-border-secondary hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <CaretLeftIcon size={13} weight="bold" />
                  {t('balance.prev')}
                </button>
                <span className="text-xs text-fg-tertiary tabular-nums">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-fg-secondary border border-border-secondary hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {t('balance.next')}
                  <CaretRightIcon size={13} weight="bold" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
