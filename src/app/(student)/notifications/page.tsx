'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Megaphone,
  CalendarBlank,
  Coin,
  ShoppingBag,
  Trophy,
  Checks
} from '@phosphor-icons/react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api/student';
import { type Notification, type NotificationType } from '@/types/student';
import { NoNotifications } from '@/components/student/EmptyState';
import { Button } from '@/components/ui/Button';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/student/PageHeader';

const typeIcons: Record<NotificationType, typeof Bell> = {
  announcement: Megaphone,
  event_reminder: CalendarBlank,
  registration_update: CalendarBlank,
  coins_received: Coin,
  redeem_status: ShoppingBag,
  achievement: Trophy,
};

const typeColors: Record<NotificationType, string> = {
  announcement: 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
  event_reminder: 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
  registration_update: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
  coins_received: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  redeem_status: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  achievement: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const groupNotificationsByDate = (notifs: Notification[]) => {
    const groups: Record<string, Notification[]> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    notifs.forEach((n) => {
      const date = new Date(n.createdAt).toDateString();
      let label: string;

      if (date === today) {
        label = 'Today';
      } else if (date === yesterday) {
        label = 'Yesterday';
      } else {
        label = new Date(n.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        });
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    });
    return groups;
  };

  const groupedNotifications = groupNotificationsByDate(notifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
        icon={Bell}
      >
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            leftIcon={<Checks className="w-4 h-4" />}
          >
            Mark all read
          </Button>
        )}
      </PageHeader>

      {/* Loading State */}
      {loading && <ListSkeleton count={5} />}

      {/* Notifications List */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([date, notifs]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-fg-tertiary mb-3">{date}</h3>
              <div className="space-y-2">
                {notifs.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && notifications.length === 0 && (
        <NoNotifications />
      )}
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type];

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <button
      onClick={() => !notification.isRead && onMarkRead(notification.id)}
      className={`
        w-full flex items-start gap-4 p-4 rounded-xl border text-left
        transition-colors
        focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
        ${notification.isRead
          ? 'bg-bg-secondary border-border-secondary'
          : 'bg-brand-25 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800'
        }
      `}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-medium ${notification.isRead ? 'text-fg-primary' : 'text-fg-primary'}`}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2" />
          )}
        </div>
        <p className="text-sm text-fg-secondary mt-1 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-fg-tertiary mt-2">{formatTime(notification.createdAt)}</p>
      </div>
    </button>
  );
}
