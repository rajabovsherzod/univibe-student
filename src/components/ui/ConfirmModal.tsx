'use client';

import { useState, type ReactNode } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  icon?: ReactNode;
}

const VARIANTS = {
  danger: {
    iconBg: 'bg-error-100 dark:bg-error-600/10',
    iconColor: 'text-error-600 dark:text-error-400',
    confirmBg: 'bg-error-600 hover:bg-error-700 text-white',
  },
  warning: {
    iconBg: 'bg-warning-100 dark:bg-warning-600/10',
    iconColor: 'text-warning-600 dark:text-warning-400',
    confirmBg: 'bg-warning-600 hover:bg-warning-700 text-white',
  },
  info: {
    iconBg: 'bg-brand-100 dark:bg-brand-600/10',
    iconColor: 'text-brand-600 dark:text-brand-400',
    confirmBg: 'bg-brand-600 hover:bg-brand-700 text-white',
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Tasdiqlash',
  cancelLabel = 'Bekor qilish',
  variant = 'danger',
  isLoading = false,
  icon,
}: ConfirmModalProps) {
  if (!isOpen) return null;
  const v = VARIANTS[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-bg-secondary border border-border-secondary shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center size-12 rounded-full ${v.iconBg} mb-4`}>
            {icon || (
              <svg className={`size-6 ${v.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            )}
          </div>

          <h3 className="text-base font-semibold text-fg-primary mb-1.5">{title}</h3>
          <p className="text-sm text-fg-tertiary leading-relaxed">{description}</p>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-10 rounded-lg border border-border-secondary bg-bg-primary text-sm font-semibold text-fg-secondary hover:bg-bg-tertiary transition-colors disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 ${v.confirmBg}`}
          >
            {isLoading ? 'Yuklanmoqda...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Convenience hook for ConfirmModal */
export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Omit<ConfirmModalProps, 'isOpen' | 'onClose' | 'onConfirm'>>({
    title: '',
    description: '',
  });
  const [resolver, setResolver] = useState<(() => void) | null>(null);

  const confirm = (opts: Omit<ConfirmModalProps, 'isOpen' | 'onClose' | 'onConfirm'>) => {
    setConfig(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => () => resolve(true));
    });
  };

  const handleClose = () => { setIsOpen(false); setResolver(null); };
  const handleConfirm = () => { resolver?.(); setIsOpen(false); setResolver(null); };

  const modal = (
    <ConfirmModal
      {...config}
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );

  return { confirm, modal };
}
