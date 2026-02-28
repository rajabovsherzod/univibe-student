'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon, StorefrontIcon, ShoppingCartSimpleIcon } from '@phosphor-icons/react';
import { useShopProducts, type ShopProduct } from '@/hooks/api/use-shop';
import { CoinOutlineIcon } from '@/components/custom-icons/brand-icon';
import { CoinPill } from '@/components/student/CoinPill';
import { useTranslation } from '@/lib/i18n/i18n';

// ── Skeletons ──────────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-secondary bg-bg-secondary shadow-sm overflow-hidden">
      <div className="aspect-square skeleton-shimmer" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 w-3/4 rounded skeleton-shimmer" />
        <div className="h-6 w-20 rounded-full skeleton-shimmer" />
      </div>
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────────────

function ProductCard({ product }: { product: ShopProduct }) {
  const { t } = useTranslation();
  const outOfStock = product.stock_type === 'LIMITED' && (product.stock_quantity ?? 0) <= 0;

  return (
    <div className="group rounded-2xl border border-border-secondary bg-bg-secondary shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-border-brand">
      {/* Image */}
      <div className="relative aspect-square bg-bg-tertiary overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="size-full flex items-center justify-center">
            <StorefrontIcon size={40} className="text-fg-quaternary" />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-xs font-bold text-white bg-error-600 px-3 py-1.5 rounded-full">{t('shop.outOfStock')}</span>
          </div>
        )}
        {product.stock_type === 'LIMITED' && !outOfStock && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-semibold text-fg-primary bg-bg-secondary/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
              {product.stock_quantity} dona
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-fg-primary truncate">{product.name}</p>
            {product.description && (
              <p className="text-xs text-fg-tertiary truncate mt-0.5">{product.description}</p>
            )}
          </div>
          <CoinPill amount={product.price_coins} size="sm" variant="primary" />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function ShopPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const { data: products = [], isPending } = useShopProducts({ search: search || undefined });

  return (
    <div className="space-y-4 pb-10">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-5 sm:p-6">
        <div className="absolute -right-4 -top-4 sm:-right-2 sm:-top-2 opacity-[0.06] pointer-events-none select-none">
          <ShoppingCartSimpleIcon size={140} weight="fill" className="text-brand-400 transform rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-fg-primary">{t('shop.title')}</h1>
            <p className="text-fg-tertiary text-xs sm:text-sm mt-0.5">{t('shop.subtitle')}</p>
          </div>
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-quaternary" />
            <input
              type="text"
              placeholder={t('shop.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-bg-primary border border-border-secondary text-sm text-fg-primary placeholder-fg-quaternary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {isPending ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => <ProductCard key={p.public_id} product={p} />)}
        </div>
      ) : (
        <div className="rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm py-16 text-center">
          <StorefrontIcon size={48} className="text-fg-quaternary mx-auto mb-3" />
          <p className="text-fg-tertiary text-sm">{t('common.loading')}</p>
        </div>
      )}
    </div>
  );
}
