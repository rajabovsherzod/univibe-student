import { type HTMLAttributes } from 'react';

type BadgeVariant = 'gray' | 'brand' | 'success' | 'warning' | 'error';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-700/20 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-700/20 dark:text-warning-500',
  error: 'bg-error-50 text-error-700 dark:bg-error-700/20 dark:text-error-500',
};

const dotStyles: Record<BadgeVariant, string> = {
  gray: 'bg-gray-500',
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1',
};

export function Badge({
  variant = 'gray',
  size = 'md',
  dot = false,
  icon,
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// Status Badge for event status
interface StatusBadgeProps {
  status: 'open' | 'registered' | 'closed' | 'cancelled';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const configs = {
    open: { variant: 'success' as const, label: 'Open', dot: true },
    registered: { variant: 'brand' as const, label: 'Registered', dot: true },
    closed: { variant: 'gray' as const, label: 'Closed', dot: true },
    cancelled: { variant: 'error' as const, label: 'Cancelled', dot: true },
  };

  const config = configs[status];

  return (
    <Badge variant={config.variant} dot={config.dot}>
      {config.label}
    </Badge>
  );
}

// Stock Badge for shop items
interface StockBadgeProps {
  stock: number;
}

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <Badge variant="error" size="sm">
        Out of stock
      </Badge>
    );
  }
  if (stock <= 5) {
    return (
      <Badge variant="warning" size="sm">
        Only {stock} left
      </Badge>
    );
  }
  return (
    <Badge variant="success" size="sm">
      In stock
    </Badge>
  );
}

// Category Badge
interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  // Format category name
  const label = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');

  return (
    <Badge variant="brand" size="sm">
      {label}
    </Badge>
  );
}

export default Badge;
