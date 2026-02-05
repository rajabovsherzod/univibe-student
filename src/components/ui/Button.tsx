'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-brand-600 text-white 
    hover:bg-brand-700 
    active:bg-brand-800
    disabled:bg-gray-300 disabled:text-gray-500
  `,
  secondary: `
    bg-bg-secondary text-fg-primary border border-border-primary
    hover:bg-gray-50 dark:hover:bg-gray-800
    active:bg-gray-100 dark:active:bg-gray-700
    disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200
  `,
  ghost: `
    bg-transparent text-fg-secondary
    hover:bg-gray-100 hover:text-fg-primary dark:hover:bg-gray-800
    active:bg-gray-200 dark:active:bg-gray-700
    disabled:text-gray-400
  `,
  danger: `
    bg-error-600 text-white
    hover:bg-error-700
    active:bg-error-700
    disabled:bg-gray-300 disabled:text-gray-500
  `,
  success: `
    bg-success-600 text-white
    hover:bg-success-700
    active:bg-success-700
    disabled:bg-gray-300 disabled:text-gray-500
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-semibold
          rounded-lg transition-all duration-150 ease-out
          focus-visible:ring-4 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-800
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size={size} />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

function LoadingSpinner({ size }: { size: ButtonSize }) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <svg
      className={`animate-spin ${sizeClass}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default Button;
