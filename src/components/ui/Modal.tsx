'use client';

import {
  Dialog,
  DialogTrigger,
  Modal as AriaModal,
  ModalOverlay,
} from 'react-aria-components';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  children: React.ReactNode;
  trigger?: React.ReactNode;
}

interface ModalContentProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({ isOpen, onOpenChange, children, trigger }: ModalProps) {
  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      {trigger}
      <ModalOverlay
        className="
          fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
          flex items-center justify-center p-4
          entering:animate-fade-in exiting:animate-fade-out
        "
      >
        <AriaModal
          className="
            w-full outline-none
            entering:animate-scale-in exiting:animate-scale-out
          "
        >
          {children}
        </AriaModal>
      </ModalOverlay>
    </DialogTrigger>
  );
}

export function ModalContent({
  title,
  description,
  children,
  showCloseButton = true,
  size = 'md',
}: ModalContentProps) {
  return (
    <Dialog
      className={`
        ${sizeStyles[size]} w-full mx-auto
        bg-bg-secondary rounded-xl shadow-xl
        border border-border-secondary
        outline-none
      `}
    >
      {({ close }) => (
        <>
          <div className="flex items-start justify-between p-6 border-b border-border-secondary">
            <div>
              <h2 className="text-lg font-semibold text-fg-primary">{title}</h2>
              {description && (
                <p className="mt-1 text-sm text-fg-secondary">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={close}
                className="
                  p-1.5 -m-1.5 rounded-lg text-fg-tertiary
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  hover:text-fg-primary transition-colors
                  focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
                "
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="p-6">{children}</div>
        </>
      )}
    </Dialog>
  );
}

// Confirm Modal for actions like redeem/cancel
interface PremiumConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'success';
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function PremiumConfirmModal({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  onConfirm,
  isLoading = false,
  icon,
}: PremiumConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  const iconBgColors = {
    primary: 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400',
    danger: 'bg-error-100 dark:bg-error-900/50 text-error-600 dark:text-error-400',
    success: 'bg-success-100 dark:bg-success-900/50 text-success-600 dark:text-success-400',
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent title="" showCloseButton={false} size="sm">
        <div className="text-center -mt-6 -mx-6 pt-6 px-6">
          {icon && (
            <div className={`
              mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4
              ${iconBgColors[variant]}
            `}>
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-fg-primary mb-2">{title}</h3>
          <p className="text-sm text-fg-secondary mb-6">{description}</p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant}
              fullWidth
              onClick={handleConfirm}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

// Success Modal for confirmations
interface SuccessModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description: string;
  buttonText?: string;
  icon?: React.ReactNode;
}

export function SuccessModal({
  isOpen,
  onOpenChange,
  title,
  description,
  buttonText = 'Done',
  icon,
}: SuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent title="" showCloseButton={false} size="sm">
        <div className="text-center -mt-6 -mx-6 pt-6 px-6">
          {icon && (
            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-success-100 dark:bg-success-900/50 text-success-600 dark:text-success-400">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-fg-primary mb-2">{title}</h3>
          <p className="text-sm text-fg-secondary mb-6">{description}</p>
          <Button
            variant="primary"
            fullWidth
            onClick={() => onOpenChange(false)}
          >
            {buttonText}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}

export default Modal;
