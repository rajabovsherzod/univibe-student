'use client';

import { useState, useEffect } from 'react';
import { getTransactions, getStudent } from '@/lib/api/student';
import { type Transaction, type TransactionFilters } from '@/types/student';
import { CoinBalanceBar, CoinPill } from '@/components/student/CoinPill';
import { QuickFilters } from '@/components/student/FilterBar';
import { NoTransactions } from '@/components/student/EmptyState';
import { TransactionSkeleton } from '@/components/ui/Skeleton';
import { TrendingUp, TrendingDown, Calendar, Gift, Trophy, ShoppingBag, RotateCcw } from 'lucide-react';

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'earned', label: 'Earned' },
  { value: 'spent', label: 'Spent' },
];

const sourceIcons = {
  event_attendance: Calendar,
  achievement: Trophy,
  bonus: Gift,
  shop_redemption: ShoppingBag,
  refund: RotateCcw,
};

export default function WalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'spent'>('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [student, txns] = await Promise.all([
        getStudent(),
        getTransactions({ type: filter !== 'all' ? filter : undefined }),
      ]);
      setUserCoins(student.coins);
      setTransactions(txns);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupTransactionsByDate = (txns: Transaction[]) => {
    const groups: Record<string, Transaction[]> = {};
    txns.forEach((tx) => {
      const date = new Date(tx.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });
    return groups;
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

  // Calculate totals
  const totalEarned = transactions
    .filter(t => t.type === 'earned')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = transactions
    .filter(t => t.type === 'spent')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-fg-primary">Wallet</h1>
        <p className="text-fg-secondary mt-1">
          Track your coin earnings and spending
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 text-white">
        <p className="text-brand-100 mb-2">Current Balance</p>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl font-bold">{userCoins.toLocaleString()}</span>
          <span className="text-brand-200">coins</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-success-300 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Total Earned</span>
            </div>
            <p className="text-xl font-semibold">+{totalEarned.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-error-300 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">Total Spent</span>
            </div>
            <p className="text-xl font-semibold">-{totalSpent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <QuickFilters
        options={filterOptions}
        value={filter}
        onChange={(val) => setFilter(val as 'all' | 'earned' | 'spent')}
      />

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <TransactionSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Transactions List */}
      {!loading && transactions.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, txns]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-fg-tertiary mb-3">{date}</h3>
              <div className="space-y-2">
                {txns.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <NoTransactions />
      )}
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const Icon = sourceIcons[transaction.source] || Calendar;
  const isEarned = transaction.type === 'earned';

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-bg-secondary rounded-xl border border-border-secondary">
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${isEarned
            ? 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400'
            : 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400'
          }
        `}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-fg-primary truncate">{transaction.description}</p>
        <p className="text-sm text-fg-tertiary">{formatTime(transaction.createdAt)}</p>
      </div>
      <div className={`font-semibold ${isEarned ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
        {isEarned ? '+' : '-'}{transaction.amount.toLocaleString()}
      </div>
    </div>
  );
}
