'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-fg-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-fg-tertiary">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-3.5 py-2.5 text-sm text-fg-primary
              bg-bg-secondary border rounded-lg
              placeholder:text-fg-disabled
              transition-all duration-150 ease-out
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${hasError
                ? 'border-error-500 focus:border-error-500 focus:ring-4 focus:ring-error-100 dark:focus:ring-error-900'
                : 'border-border-primary hover:border-border-brand focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900'
              }
              disabled:bg-gray-50 disabled:text-fg-disabled disabled:cursor-not-allowed
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-fg-tertiary">
              {rightIcon}
            </div>
          )}
        </div>
        {(hint || error) && (
          <p
            id={hasError ? `${inputId}-error` : `${inputId}-hint`}
            className={`mt-1.5 text-sm ${hasError ? 'text-error-600' : 'text-fg-tertiary'}`}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
