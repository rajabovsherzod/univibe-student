import Link from 'next/link';
import { Coins } from 'lucide-react';
import { type ShopItem } from '@/types/student';
import { StockBadge, CategoryBadge } from '@/components/ui/Badge';
import { CoinPill } from './CoinPill';

interface ShopItemCardProps {
  item: ShopItem;
  userCoins?: number;
}

export function ShopItemCard({ item, userCoins }: ShopItemCardProps) {
  const canAfford = userCoins !== undefined ? userCoins >= item.coinCost : true;
  const isAvailable = item.isAvailable && item.stock > 0;

  return (
    <Link
      href={`/shop/${item.id}`}
      className={`
        group block bg-bg-secondary rounded-xl overflow-hidden
        border border-border-secondary
        hover:border-border-brand hover:shadow-lg
        transition-all duration-200
        focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
        ${!isAvailable ? 'opacity-60' : ''}
      `}
    >
      {/* Image */}
      <div className="relative h-44 bg-bg-tertiary overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <CategoryBadge category={item.category} />
        </div>
        <div className="absolute top-3 right-3">
          <StockBadge stock={item.stock} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-fg-primary mb-2 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {item.name}
        </h3>
        <p className="text-sm text-fg-secondary line-clamp-2 mb-3">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-lg text-fg-primary">
              {item.coinCost.toLocaleString()}
            </span>
          </div>
          {userCoins !== undefined && !canAfford && (
            <span className="text-xs text-error-600 dark:text-error-400">
              Need {(item.coinCost - userCoins).toLocaleString()} more
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Compact Shop Item for lists
export function ShopItemCompact({ item, userCoins }: ShopItemCardProps) {
  const canAfford = userCoins !== undefined ? userCoins >= item.coinCost : true;

  return (
    <Link
      href={`/shop/${item.id}`}
      className="
        group flex gap-4 p-4 bg-bg-secondary rounded-xl
        border border-border-secondary
        hover:border-border-brand hover:shadow-md
        transition-all duration-200
        focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
      "
    >
      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-bg-tertiary">
        <img
          src={item.image}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-fg-primary truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {item.name}
          </h4>
          <StockBadge stock={item.stock} />
        </div>
        <p className="text-sm text-fg-secondary truncate mb-2">{item.description}</p>
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className={`font-semibold ${canAfford ? 'text-fg-primary' : 'text-error-600 dark:text-error-400'}`}>
            {item.coinCost.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ShopItemCard;
