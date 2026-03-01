'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, StorefrontIcon, CoinVerticalIcon, ArrowRight } from '@phosphor-icons/react';
import { CoinPill } from '@/components/student/CoinPill';
import { useTranslation } from '@/lib/i18n/i18n';
import type { ShopProduct } from '@/hooks/api/use-shop';

interface RedeemModalProps {
  product: ShopProduct | null;
  userBalance: number;
  isLoading: boolean;
  onConfirm: (productId: string) => void;
  onClose: () => void;
}

export function RedeemModal({ product, userBalance, isLoading, onConfirm, onClose }: RedeemModalProps) {
  const { t } = useTranslation();

  if (!product) return null;

  const canAfford = userBalance >= product.price_coins;
  const remainingBalance = userBalance - product.price_coins;
  const outOfStock = product.stock_type === 'LIMITED' && (product.stock_quantity ?? 0) <= 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-bg-secondary border border-border-secondary shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white transition-colors"
        >
          <X size={18} weight="bold" />
        </button>

        {/* Product image */}
        <div className="relative aspect-[16/10] bg-bg-tertiary overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="size-full flex items-center justify-center">
              <StorefrontIcon size={56} className="text-fg-quaternary" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Product name on image */}
          <div className="absolute bottom-4 left-5 right-5">
            <h3 className="text-lg font-bold text-white leading-snug drop-shadow-sm">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-white/70 mt-1 line-clamp-2">{product.description}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Price row */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-bg-tertiary">
            <span className="text-sm font-medium text-fg-secondary">{t('shop.redeemPrice')}</span>
            <CoinPill amount={product.price_coins} size="sm" variant="primary" />
          </div>

          {/* Balance comparison */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border-secondary bg-bg-primary/50">
            <div className="flex-1 flex flex-col items-center">
              <p className="text-[11px] text-fg-tertiary uppercase tracking-wider font-semibold mb-2">{t('shop.redeemBalance')}</p>
              <CoinPill amount={userBalance} size="md" variant={canAfford ? 'primary' : 'silver'} />
            </div>
            <div className="shrink-0 pt-6">
              <ArrowRight size={18} className="text-fg-quaternary" />
            </div>
            <div className="flex-1 flex flex-col items-center">
              <p className="text-[11px] text-fg-tertiary uppercase tracking-wider font-semibold mb-2">{t('shop.redeemAfter')}</p>
              {canAfford ? (
                <CoinPill amount={remainingBalance} size="md" variant="gold" />
              ) : (
                <span className="text-lg font-bold text-fg-tertiary">—</span>
              )}
            </div>
          </div>

          {/* Insufficient balance warning */}
          {!canAfford && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-error-50 dark:bg-error-600/10 border border-error-200 dark:border-error-600/20">
              <CoinVerticalIcon size={16} className="text-error-500 shrink-0" />
              <p className="text-xs font-medium text-error-600 dark:text-error-400">{t('shop.insufficientBalance')}</p>
            </div>
          )}

          {/* Out of stock warning */}
          {outOfStock && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-error-50 dark:bg-error-600/10 border border-error-200 dark:border-error-600/20">
              <StorefrontIcon size={16} className="text-error-500 shrink-0" />
              <p className="text-xs font-medium text-error-600 dark:text-error-400">{t('shop.outOfStock')}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl text-sm font-semibold text-fg-secondary border border-border-secondary hover:bg-bg-tertiary transition-colors"
            >
              {t('shop.redeemCancel')}
            </button>
            <button
              type="button"
              onClick={() => onConfirm(product.public_id)}
              disabled={!canAfford || outOfStock || isLoading}
              className="flex-1 h-11 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('shop.loading')}
                </>
              ) : (
                <>
                  <CoinVerticalIcon size={15} weight="fill" />
                  {t('shop.redeemConfirm')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
