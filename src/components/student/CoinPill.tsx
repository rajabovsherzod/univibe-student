import { Coins } from 'lucide-react';

interface CoinPillProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function CoinPill({
  amount,
  size = 'md',
  showIcon = true,
  className = '',
}: CoinPillProps) {
  const formattedAmount = amount.toLocaleString();

  return (
    <div
      className={`
        inline-flex items-center font-semibold rounded-full
        bg-gradient-to-r from-amber-100 to-yellow-100
        dark:from-amber-900/30 dark:to-yellow-900/30
        text-amber-700 dark:text-amber-400
        border border-amber-200 dark:border-amber-800
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {showIcon && <Coins className={iconSizes[size]} />}
      <span>{formattedAmount}</span>
    </div>
  );
}

// Wallet Balance Bar - fixed at top or bottom
interface CoinBalanceBarProps {
  amount: number;
}

export function CoinBalanceBar({ amount }: CoinBalanceBarProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-bg-secondary border-b border-border-secondary">
      <span className="text-sm text-fg-secondary">Your Balance</span>
      <CoinPill amount={amount} size="md" />
    </div>
  );
}

export default CoinPill;
