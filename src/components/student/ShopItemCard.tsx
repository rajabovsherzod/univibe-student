import Link from 'next/link';
import { Coin } from '@phosphor-icons/react';
import { type ShopItem } from '@/types/student';

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
        group block bg-bg-secondary rounded-2xl overflow-hidden shadow-sm
        border border-border-secondary
        hover:border-brand-300 dark:hover:border-brand-600
        hover:shadow-xl hover:shadow-brand-500/10
        hover:-translate-y-1
        transition-all duration-300
        focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
        ${!isAvailable ? 'opacity-60 pointer-events-none' : ''}
      `}
    >
      {/* Image */}
      <div className="relative h-48 bg-bg-tertiary overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Content - Clean and minimal */}
      <div className="p-4">
        {/* Item name */}
        <h3 className="font-semibold text-fg-primary mb-3 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {item.name}
        </h3>

        {/* Stock and Price row */}
        <div className="flex items-center justify-between">
          {/* Stock */}
          <span className="text-sm text-fg-tertiary">
            {item.stock > 0 ? `${item.stock} left` : 'Out of stock'}
          </span>

          {/* Price pill */}
          <div className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full
            ${canAfford
              ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
              : 'bg-error-50 dark:bg-error-950 text-error-600 dark:text-error-400'
            }
          `}>
            <Coin size={16} weight="fill" />
            <span className="font-bold text-sm">
              {item.coinCost.toLocaleString()}
            </span>
          </div>
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
        group flex gap-4 p-4 bg-bg-secondary rounded-xl shadow-sm
        border border-border-secondary
        hover:border-brand-300 dark:hover:border-brand-600
        hover:shadow-md
        transition-all duration-300
        focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
      "
    >
      <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-bg-tertiary">
        <img
          src={item.image}
          alt=""
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <h4 className="font-semibold text-fg-primary truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {item.name}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-sm text-fg-tertiary">
            {item.stock > 0 ? `${item.stock} left` : 'Out of stock'}
          </span>
          <div className={`
            flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
            ${canAfford
              ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
              : 'bg-error-50 dark:bg-error-950 text-error-600 dark:text-error-400'
            }
          `}>
            <Coin size={12} weight="fill" />
            <span className="font-bold">{item.coinCost.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ShopItemCard;
