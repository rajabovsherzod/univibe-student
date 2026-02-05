'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Coins, Package, CheckCircle, ShoppingBag } from 'lucide-react';
import { getShopItem, getStudent, redeemItem } from '@/lib/api/student';
import { type ShopItem } from '@/types/student';
import { Button } from '@/components/ui/Button';
import { StockBadge, CategoryBadge } from '@/components/ui/Badge';
import { PremiumConfirmModal, SuccessModal } from '@/components/ui/Modal';
import { CoinPill } from '@/components/student/CoinPill';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';

export default function ShopItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [item, setItem] = useState<ShopItem | null>(null);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [itemId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemData, student] = await Promise.all([
        getShopItem(itemId),
        getStudent(),
      ]);
      setItem(itemData);
      setUserCoins(student.coins);
    } catch (error) {
      console.error('Failed to load item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!item) return;
    setIsRedeeming(true);
    try {
      const result = await redeemItem(item.id);
      if (result.success) {
        setUserCoins(prev => prev - item.coinCost);
        setItem({ ...item, stock: item.stock - 1 });
        setShowConfirmModal(false);
        setShowSuccessModal(true);
        toast.success('Item redeemed successfully!');
      } else {
        toast.error(result.error || 'Failed to redeem item');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (loading) {
    return <ShopItemSkeleton />;
  }

  if (!item) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-fg-primary mb-2">Item not found</h2>
        <p className="text-fg-secondary mb-6">The item you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/shop')}>
          Back to Shop
        </Button>
      </div>
    );
  }

  const canAfford = userCoins >= item.coinCost;
  const isAvailable = item.isAvailable && item.stock > 0;
  const canRedeem = canAfford && isAvailable;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href="/shop"
        className="
          inline-flex items-center gap-2 text-sm text-fg-secondary
          hover:text-fg-primary transition-colors
          focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900 rounded
        "
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-bg-tertiary">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CategoryBadge category={item.category} />
              <StockBadge stock={item.stock} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-fg-primary mb-2">
              {item.name}
            </h1>
            <p className="text-fg-secondary">{item.description}</p>
          </div>

          {/* Price */}
          <div className="bg-bg-secondary rounded-xl border border-border-secondary p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-fg-tertiary">Price</span>
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-amber-500" />
                <span className="text-3xl font-bold text-fg-primary">
                  {item.coinCost.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-secondary">
              <span className="text-fg-tertiary">Your Balance</span>
              <CoinPill amount={userCoins} size="md" />
            </div>
            {!canAfford && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-error-600 dark:text-error-400">Need more coins</span>
                <span className="font-medium text-error-600 dark:text-error-400">
                  {(item.coinCost - userCoins).toLocaleString()} more needed
                </span>
              </div>
            )}
          </div>

          {/* Rules */}
          {item.rules && (
            <div className="bg-warning-50 dark:bg-warning-900/20 rounded-xl border border-warning-200 dark:border-warning-800 p-4">
              <h3 className="font-medium text-warning-800 dark:text-warning-200 mb-2">
                Redemption Rules
              </h3>
              <p className="text-sm text-warning-700 dark:text-warning-300">{item.rules}</p>
            </div>
          )}

          {/* Stock Info */}
          <div className="flex items-center gap-3 text-sm text-fg-secondary">
            <Package className="w-4 h-4" />
            <span>
              {item.stock > 0
                ? `${item.stock} items remaining`
                : 'Out of stock'
              }
            </span>
          </div>

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canRedeem}
            onClick={() => setShowConfirmModal(true)}
            leftIcon={<ShoppingBag className="w-5 h-5" />}
          >
            {!isAvailable
              ? 'Out of Stock'
              : !canAfford
                ? 'Not Enough Coins'
                : 'Redeem Item'
            }
          </Button>
        </div>
      </div>

      {/* Confirm Modal - Step 1 */}
      <PremiumConfirmModal
        isOpen={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title="Confirm Redemption"
        description={`Are you sure you want to redeem "${item.name}" for ${item.coinCost.toLocaleString()} coins? This action cannot be undone.`}
        confirmText="Redeem Item"
        onConfirm={handleRedeem}
        isLoading={isRedeeming}
        icon={<Coins className="w-6 h-6" />}
      />

      {/* Success Modal - Step 2 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title="Redemption Successful!"
        description={`You've successfully redeemed "${item.name}". Check your notifications for pickup/delivery details.`}
        icon={<CheckCircle className="w-6 h-6" />}
      />
    </div>
  );
}

function ShopItemSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
