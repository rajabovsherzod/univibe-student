'use client';

import { TrendUp, TrendDown, Minus, Crown } from '@phosphor-icons/react';

interface RankChipProps {
  rank: number;
  previousRank?: number;
  size?: 'sm' | 'md' | 'lg';
  showMovement?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'text-xs px-2.5 py-1 gap-1.5',
  md: 'text-sm px-3.5 py-1.5 gap-2',
  lg: 'text-base px-4 py-2 gap-2.5',
};

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16,
};

export function RankChip({
  rank,
  previousRank,
  size = 'md',
  showMovement = true,
  className = '',
}: RankChipProps) {
  const movement = previousRank ? previousRank - rank : 0;
  const isUp = movement > 0;
  const isDown = movement < 0;
  const isStable = movement === 0;

  // Top 3 gets special treatment
  const isTopRank = rank <= 3;

  return (
    <div
      className={`
        relative inline-flex items-center font-bold rounded-full
        overflow-hidden
        ${isTopRank
          ? 'bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500 text-white border border-brand-400/50 shadow-[0_2px_8px_rgba(0,114,176,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]'
          : 'bg-gradient-to-r from-brand-100 to-brand-50 dark:from-brand-900 dark:to-brand-950 text-brand-700 dark:text-brand-200 border border-brand-200 dark:border-brand-700'
        }
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {/* Shimmer for top ranks */}
      {isTopRank && (
        <div
          className="
            absolute inset-0 
            bg-gradient-to-r from-transparent via-white/25 to-transparent
            -translate-x-full
          "
          style={{
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
      )}

      {isTopRank && (
        <Crown
          size={iconSizes[size]}
          weight="fill"
          className="relative z-10 text-yellow-300 drop-shadow-sm"
        />
      )}

      <span className="relative z-10 tracking-tight">#{rank}</span>

      {showMovement && previousRank !== undefined && movement !== 0 && (
        <span
          className={`
            relative z-10 flex items-center gap-0.5 text-xs font-semibold
            ${isUp ? 'text-success-400' : ''}
            ${isDown ? 'text-error-400' : ''}
          `}
        >
          {isUp && <TrendUp size={iconSizes[size]} weight="bold" />}
          {isDown && <TrendDown size={iconSizes[size]} weight="bold" />}
          <span>{Math.abs(movement)}</span>
        </span>
      )}
    </div>
  );
}

// Rank Position for top 3 podium
interface RankPositionProps {
  rank: 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
}

const medalStyles = {
  1: 'from-amber-300 via-yellow-400 to-amber-500 text-amber-900 border-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.5)]',
  2: 'from-gray-200 via-gray-300 to-gray-400 text-gray-700 border-gray-300 shadow-[0_4px_16px_rgba(156,163,175,0.4)]',
  3: 'from-orange-300 via-amber-400 to-orange-500 text-orange-900 border-orange-400 shadow-[0_4px_16px_rgba(251,146,60,0.4)]',
};

const positionSizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-xl',
};

export function RankPosition({ rank, size = 'md' }: RankPositionProps) {
  return (
    <div
      className={`
        relative flex items-center justify-center rounded-full font-black
        bg-gradient-to-b ${medalStyles[rank]} border-2
        overflow-hidden
        ${positionSizes[size]}
      `}
    >
      {/* Shine effect */}
      <div
        className="
          absolute inset-0 
          bg-gradient-to-br from-white/50 via-transparent to-transparent
        "
      />
      <span className="relative z-10 drop-shadow-sm">{rank}</span>
    </div>
  );
}

export default RankChip;
