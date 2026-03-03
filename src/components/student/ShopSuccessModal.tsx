'use client';

import { useTranslation } from '@/lib/i18n/i18n';
import { GiftIcon } from '@phosphor-icons/react';
import { Modal, ModalContent } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ShopSuccessModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ShopSuccessModal({ isOpen, onOpenChange }: ShopSuccessModalProps) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent title="" showCloseButton={true} size="sm">
        <div className="text-center pb-2 px-2">
          <div className="relative mx-auto w-24 h-24 mb-6 mt-2 flex items-center justify-center">
            {/* Pulsing ring 1 */}
            <div className="absolute inset-0 rounded-full border-4 border-brand-200 dark:border-brand-800 animate-ping opacity-30" />
            {/* Pulsing ring 2 */}
            <div className="absolute inset-2 rounded-full border-4 border-amber-200 dark:border-amber-800/50 animate-ping opacity-40" style={{ animationDelay: '0.5s' }} />
            {/* Center circle */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-amber-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <GiftIcon size={40} weight="fill" className="text-white drop-shadow-md" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-fg-primary mb-3">
            {t('shop.redeemSuccessModalTitle') || 'Ajoyib xarid! 🎉'}
          </h3>

          <p className="text-[15px] leading-relaxed text-fg-secondary mb-8">
            {t('shop.redeemSuccessModalDesc') || "Siz ushbu mahsulotni muvaffaqiyatli xarid qildingiz. Uni kutilmagan sovgʻa sifatida qabul qilib olish va qo'shimcha ma'lumotlar uchun universitet ma'muriyatiga murojaat qiling."}
          </p>

          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => onOpenChange(false)}
            className="shadow-md"
          >
            {t('shop.redeemSuccessBtn') || 'Tushunarli'}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
