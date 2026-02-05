import { LucideIcon, Search, Calendar, ShoppingBag, Trophy, Inbox, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon = Inbox,
  iconClassName = '',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className={`
        w-16 h-16 rounded-full flex items-center justify-center mb-4
        bg-bg-tertiary text-fg-tertiary
        ${iconClassName}
      `}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-fg-primary mb-2">{title}</h3>
      <p className="text-sm text-fg-secondary max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Pre-made Empty States
export function NoEventsFound() {
  return (
    <EmptyState
      icon={Calendar}
      title="No events found"
      description="Try adjusting your search or filters to find what you're looking for."
    />
  );
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search.`}
    />
  );
}

export function NoShopItems() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="No items available"
      description="Check back later for new items in the shop."
    />
  );
}

export function NoTransactions() {
  return (
    <EmptyState
      icon={Trophy}
      title="No transactions yet"
      description="Your coin history will appear here once you start earning or spending coins."
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon={Bell}
      title="No notifications"
      description="You're all caught up! We'll notify you when something important happens."
    />
  );
}

export function NoRegisteredEvents() {
  return (
    <EmptyState
      icon={Calendar}
      title="No registered events"
      description="Browse events and register for ones that interest you."
      action={{
        label: 'Explore Events',
        onClick: () => window.location.href = '/events',
      }}
    />
  );
}

export default EmptyState;
