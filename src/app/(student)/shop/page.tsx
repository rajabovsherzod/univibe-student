'use client';

import { useState, useEffect } from 'react';
import { getShopItems, getStudent } from '@/lib/api/student';
import { type ShopItem, type ShopCategory, type ShopFilters } from '@/types/student';
import { ShopItemCard } from '@/components/student/ShopItemCard';
import { CoinBalanceBar } from '@/components/student/CoinPill';
import { FilterBar, QuickFilters } from '@/components/student/FilterBar';
import { NoShopItems, NoSearchResults } from '@/components/student/EmptyState';
import { ShopItemSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/student/PageHeader';

const categoryOptions = [
  { value: 'all', label: 'All' },
  { value: 'merch', label: 'Merch' },
  { value: 'services', label: 'Services' },
  { value: 'privileges', label: 'Privileges' },
];

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, [searchQuery, categoryFilter, showAvailableOnly]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [student, shopItems] = await Promise.all([
        getStudent(),
        getShopItems({
          search: searchQuery || undefined,
          category: categoryFilter !== 'all' ? categoryFilter as ShopCategory : undefined,
          availableOnly: showAvailableOnly,
        }),
      ]);
      setUserCoins(student.coins);
      setItems(shopItems);
    } catch (error) {
      console.error('Failed to load shop items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="University Shop"
        subtitle="Redeem your coins for exclusive items and privileges"
        iconName="storefront"
      />

      {/* Coin Balance Bar */}
      <div className="bg-bg-secondary rounded-xl border border-border-secondary shadow-sm overflow-hidden">
        <CoinBalanceBar amount={userCoins} />
      </div>

      {/* Category Filters */}
      <QuickFilters
        options={categoryOptions}
        value={categoryFilter}
        onChange={setCategoryFilter}
      />

      {/* Search */}
      <FilterBar
        searchPlaceholder="Search items..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Available Only Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showAvailableOnly}
          onChange={(e) => setShowAvailableOnly(e.target.checked)}
          className="
            w-4 h-4 rounded border-border-primary
            text-brand-600 focus:ring-brand-500
          "
        />
        <span className="text-sm text-fg-secondary">Show available only</span>
      </label>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ShopItemSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Items Grid */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ShopItemCard key={item.id} item={item} userCoins={userCoins} />
          ))}
        </div>
      )}

      {/* Empty States */}
      {!loading && items.length === 0 && searchQuery && (
        <NoSearchResults query={searchQuery} />
      )}
      {!loading && items.length === 0 && !searchQuery && (
        <NoShopItems />
      )}
    </div>
  );
}
