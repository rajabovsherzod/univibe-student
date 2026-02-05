'use client';

import { Coin } from '@phosphor-icons/react';

interface CoinPillProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  variant?: 'gold' | 'silver' | 'bronze' | 'primary';
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-base px-4 py-2 gap-2',
  lg: 'text-lg px-5 py-2.5 gap-2.5',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
};

const variantStyles = {
  gold: {
    bg: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
    border: 'border-amber-500/60',
    shadow: 'shadow-[0_2px_10px_rgba(245,158,11,0.5),inset_0_1px_0_rgba(255,255,255,0.4)]',
    text: 'text-white',
    icon: 'text-amber-100',
  },
  silver: {
    bg: 'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-400',
    border: 'border-gray-400/60',
    shadow: 'shadow-[0_2px_10px_rgba(156,163,175,0.5),inset_0_1px_0_rgba(255,255,255,0.5)]',
    text: 'text-gray-800',
    icon: 'text-gray-600',
  },
  bronze: {
    bg: 'bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500',
    border: 'border-orange-500/60',
    shadow: 'shadow-[0_2px_10px_rgba(251,146,60,0.5),inset_0_1px_0_rgba(255,255,255,0.4)]',
    text: 'text-white',
    icon: 'text-orange-100',
  },
  primary: {
    bg: 'bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500',
    border: 'border-brand-400/60',
    shadow: 'shadow-[0_2px_10px_rgba(0,114,176,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]',
    text: 'text-white',
    icon: 'text-brand-100',
  },
};

export function CoinPill({
  amount,
  size = 'md',
  showIcon = true,
  variant = 'gold',
  className = '',
}: CoinPillProps) {
  const formattedAmount = amount.toLocaleString();
  const styles = variantStyles[variant];

  return (
    <div
      className={`
        coin-pill relative inline-flex items-center rounded-full
        ${styles.bg}
        ${styles.text}
        border ${styles.border}
        ${styles.shadow}
        overflow-hidden
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {/* Diagonal shimmer - professional loop (reset ko'rinmaydi) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="
            absolute top-[-40%] left-[-60%]
            h-[180%] w-[60%]
            bg-gradient-to-r from-transparent via-white/40 to-transparent
            will-change-transform
          "
          style={{
            animation: 'coinShimmer 2.6s linear infinite',
          }}
        />
      </div>

      {showIcon && (
        <span className={`relative z-10 ${styles.icon} drop-shadow-sm`}>
          <Coin size={iconSizes[size]} weight="fill" />
        </span>
      )}

      <span className="relative z-10 font-extrabold drop-shadow-sm tracking-tight">
        {formattedAmount}
      </span>
    </div>
  );
}

interface CoinBalanceBarProps {
  amount: number;
}

export function CoinBalanceBar({ amount }: CoinBalanceBarProps) {
  return (
    <div className="flex items-center justify-between py-4 px-5 bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-950/50 dark:to-brand-900/30 border-b border-brand-200 dark:border-brand-800">
      <span className="text-sm font-medium text-brand-700 dark:text-brand-300">Your Balance</span>
      <CoinPill amount={amount} size="md" variant="gold" />
    </div>
  );
}

export default CoinPill;
