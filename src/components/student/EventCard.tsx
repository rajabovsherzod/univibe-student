'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users, Coins } from 'lucide-react';
import { type Event } from '@/types/student';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact';
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const spotsLeft = event.capacity - event.registeredCount;
  const isFull = spotsLeft <= 0;

  if (variant === 'compact') {
    return (
      <Link
        href={`/events/${event.id}`}
        className="
          group flex gap-4 p-4 bg-bg-secondary rounded-xl
          border border-border-secondary
          hover:border-border-brand hover:shadow-md
          transition-all duration-200
          focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
        "
      >
        {event.coverImage && (
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-bg-tertiary">
            <img
              src={event.coverImage}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-fg-primary truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {event.title}
            </h3>
            <StatusBadge status={event.status} />
          </div>
          <p className="text-sm text-fg-secondary mb-2">
            {formatDate(event.date)} • {formatTime(event.startTime)}
          </p>
          <div className="flex items-center gap-3 text-xs text-fg-tertiary">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {event.location}
            </span>
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              +{event.coinReward}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/events/${event.id}`}
      className="
        group block bg-bg-secondary rounded-xl overflow-hidden
        border border-border-secondary
        hover:border-border-brand hover:shadow-lg
        transition-all duration-200
        focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
      "
    >
      {/* Cover Image */}
      <div className="relative h-36 bg-bg-tertiary overflow-hidden">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800" />
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={event.status} />
        </div>
        {event.coinReward > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            +{event.coinReward}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-fg-primary mb-2 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {event.title}
        </h3>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-fg-secondary">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>
              {formatDate(event.date)} • {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-fg-secondary">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-fg-secondary">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className={isFull ? 'text-error-600 dark:text-error-400' : ''}>
              {isFull ? 'No spots left' : `${spotsLeft} spots left`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <CategoryBadge category={event.category} />
          {event.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-fg-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// Horizontal Scrollable Event Card for Carousel
export function EventCarouselCard({ event }: { event: Event }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link
      href={`/events/${event.id}`}
      className="
        group flex-shrink-0 w-64 bg-bg-secondary rounded-xl overflow-hidden
        border border-border-secondary
        hover:border-border-brand hover:shadow-lg
        transition-all duration-200
        focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
      "
    >
      <div className="relative h-28 bg-bg-tertiary overflow-hidden">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800" />
        )}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-white text-xs font-medium">
          {formatDate(event.date)}
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm text-fg-primary truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {event.title}
        </h4>
        <p className="text-xs text-fg-tertiary mt-1 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {event.location}
        </p>
      </div>
    </Link>
  );
}

export default EventCard;
