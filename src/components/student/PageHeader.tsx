'use client';

import { type ReactNode } from 'react';
import type { Icon } from '@phosphor-icons/react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: Icon;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, icon: IconComponent, children }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-6 sm:p-8 mb-6">
      {/* Background decorative icon */}
      {IconComponent && (
        <div className="absolute -right-4 -top-4 sm:-right-2 sm:-top-2 opacity-[0.12] dark:opacity-[0.10] pointer-events-none select-none">
          <IconComponent size={160} weight="fill" className="text-brand-400 transform rotate-12" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-fg-primary">
              {title}
            </h1>
            {subtitle && (
              <p className="text-fg-tertiary mt-1.5 text-sm sm:text-base max-w-lg">
                {subtitle}
              </p>
            )}
          </div>

          {/* Optional children (like action buttons or stats) */}
          {children && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Home page specific header with greeting
interface HomeHeaderProps {
  studentName: string;
  coins: number;
  rank: number;
  previousRank?: number;
}

export function HomeHeader({ studentName, coins, rank, previousRank }: HomeHeaderProps) {
  // Dynamic import to avoid SSR issues
  const { CoinPill } = require('@/components/student/CoinPill');
  const { RankChip } = require('@/components/student/RankChip');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = studentName.split(' ')[0];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-secondary mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-fg-primary">
          {getGreeting()}, {firstName}! 👋
        </h1>
        <p className="text-fg-tertiary mt-1 text-sm sm:text-base">
          Here&apos;s what&apos;s happening at your university today
        </p>
      </div>
      <div className="flex items-center gap-3">
        <CoinPill amount={coins} size="md" variant="gold" />
        <RankChip rank={rank} previousRank={previousRank} size="md" />
      </div>
    </div>
  );
}

export default PageHeader;
