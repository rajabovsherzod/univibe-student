import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RankChipProps {
  rank: number;
  previousRank?: number;
  size?: 'sm' | 'md' | 'lg';
  showMovement?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
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

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return (
    <div
      className={`
        inline-flex items-center font-semibold rounded-full
        bg-brand-50 dark:bg-brand-950
        text-brand-700 dark:text-brand-300
        border border-brand-200 dark:border-brand-800
        ${sizeStyles[size]}
        ${className}
      `}
    >
      <span>#{rank}</span>
      {showMovement && previousRank !== undefined && (
        <span
          className={`
            flex items-center gap-0.5 text-xs
            ${isUp ? 'text-success-600 dark:text-success-400' : ''}
            ${isDown ? 'text-error-600 dark:text-error-400' : ''}
            ${isStable ? 'text-fg-tertiary' : ''}
          `}
        >
          {isUp && <TrendingUp className={iconSizes[size]} />}
          {isDown && <TrendingDown className={iconSizes[size]} />}
          {isStable && <Minus className={iconSizes[size]} />}
          {movement !== 0 && (
            <span className="font-medium">{Math.abs(movement)}</span>
          )}
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
  1: 'from-amber-400 to-yellow-500 text-amber-900 border-amber-500',
  2: 'from-gray-300 to-gray-400 text-gray-700 border-gray-400',
  3: 'from-orange-400 to-amber-600 text-orange-900 border-orange-500',
};

const positionSizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

export function RankPosition({ rank, size = 'md' }: RankPositionProps) {
  return (
    <div
      className={`
        flex items-center justify-center rounded-full font-bold
        bg-gradient-to-b ${medalStyles[rank]} border-2
        shadow-md
        ${positionSizes[size]}
      `}
    >
      {rank}
    </div>
  );
}

export default RankChip;
