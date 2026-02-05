import Link from 'next/link';
import { Calendar, Pin } from 'lucide-react';
import { type Announcement } from '@/types/student';
import { Badge } from '@/components/ui/Badge';

interface AnnouncementCardProps {
  announcement: Announcement;
  variant?: 'default' | 'compact';
}

const categoryStyles = {
  general: { variant: 'gray' as const, label: 'General' },
  academic: { variant: 'brand' as const, label: 'Academic' },
  event: { variant: 'success' as const, label: 'Event' },
  urgent: { variant: 'error' as const, label: 'Urgent' },
};

export function AnnouncementCard({ announcement, variant = 'default' }: AnnouncementCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const categoryConfig = categoryStyles[announcement.category];

  if (variant === 'compact') {
    return (
      <div
        className={`
          p-4 bg-bg-secondary rounded-xl border shadow-sm
          ${announcement.isPinned ? 'border-brand-300 dark:border-brand-700 bg-brand-25 dark:bg-brand-950/30' : 'border-border-secondary'}
        `}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            {announcement.isPinned && (
              <Pin className="w-4 h-4 text-brand-500 flex-shrink-0" />
            )}
            <h4 className="font-medium text-fg-primary line-clamp-1">
              {announcement.title}
            </h4>
          </div>
          <Badge variant={categoryConfig.variant} size="sm">
            {categoryConfig.label}
          </Badge>
        </div>
        <p className="text-sm text-fg-secondary line-clamp-2 mb-2">
          {announcement.content}
        </p>
        <p className="text-xs text-fg-tertiary">{formatDate(announcement.createdAt)}</p>
      </div>
    );
  }

  return (
    <div
      className={`
        p-5 bg-bg-secondary rounded-xl border shadow-sm transition-all duration-200
        hover:shadow-md
        ${announcement.isPinned
          ? 'border-brand-300 dark:border-brand-700 bg-brand-25 dark:bg-brand-950/30'
          : 'border-border-secondary hover:border-border-brand'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2">
          {announcement.isPinned && (
            <Pin className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
          )}
          <h3 className="font-semibold text-lg text-fg-primary">
            {announcement.title}
          </h3>
        </div>
        <Badge variant={categoryConfig.variant}>
          {categoryConfig.label}
        </Badge>
      </div>

      <p className="text-fg-secondary mb-4 line-clamp-3">
        {announcement.content}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-fg-tertiary">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(announcement.createdAt)}</span>
          <span className="text-border-primary">•</span>
          <span>{announcement.author}</span>
        </div>
      </div>
    </div>
  );
}

// Pinned Announcement Banner
interface PinnedBannerProps {
  announcement: Announcement;
}

export function PinnedAnnouncementBanner({ announcement }: PinnedBannerProps) {
  return (
    <div className="p-4 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-950 dark:to-brand-900 rounded-xl border border-brand-200 dark:border-brand-800">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center">
          <Pin className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-fg-primary mb-1">{announcement.title}</h4>
          <p className="text-sm text-fg-secondary line-clamp-2">{announcement.content}</p>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementCard;
