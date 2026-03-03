'use client';

import Link from 'next/link';
import { MapPin, Coin } from '@phosphor-icons/react';
import { type Event } from '@/types/student';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import { IconWrapper, ViewArrow } from '@/components/ui/IconWrapper';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact';
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
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
          group flex gap-4 p-4 bg-bg-secondary rounded-2xl shadow-sm
          border border-border-secondary
          hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-lg hover:shadow-brand-500/10
          transition-all duration-300
          focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
        "
      >
        {event.coverImage && (
          <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-bg-tertiary shadow-sm">
            <img
              src={event.coverImage}
              alt=""
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
              <MapPin size={14} weight="fill" />
              {event.location}
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
              <Coin size={14} weight="fill" />
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
        group block bg-bg-secondary rounded-2xl overflow-hidden shadow-sm
        border border-border-secondary
        hover:border-brand-300 dark:hover:border-brand-600 
        hover:shadow-xl hover:shadow-brand-500/10
        hover:-translate-y-1
        transition-all duration-300
        focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
      "
    >
      {/* Cover Image */}
      <div className="relative h-40 bg-bg-tertiary overflow-hidden">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt=""
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 via-brand-200 to-brand-300 dark:from-brand-900 dark:via-brand-800 dark:to-brand-700" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={event.status} />
        </div>

        {/* Coin reward badge - premium style */}
        {event.coinReward > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full text-white text-sm font-bold shadow-lg shadow-amber-500/30">
            <Coin size={16} weight="fill" />
            +{event.coinReward}
          </div>
        )}

        {/* Date badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-sm">
          <p className="text-xs font-bold text-brand-600 dark:text-brand-400">{formatDate(event.date)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-fg-primary mb-3 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {event.title}
        </h3>

        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2.5 text-sm text-fg-secondary">
            <IconWrapper iconName="clock" size="md" />
            <span>
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-fg-secondary">
            <IconWrapper iconName="map-pin" size="md" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <IconWrapper iconName="users" size="md" />
            <span className={isFull ? 'text-error-600 dark:text-error-400 font-medium' : 'text-fg-secondary'}>
              {isFull ? 'No spots left' : `${spotsLeft} spots left`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border-secondary">
          <div className="flex flex-wrap gap-2">
            <CategoryBadge category={event.category} />
            {event.tags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-bg-tertiary text-fg-secondary font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* View arrow */}
          <ViewArrow size="md" />
        </div>
      </div>
    </Link>
  );
}

// Horizontal Scrollable Event Card for Carousel - Premium Version
export function EventCarouselCard({ event }: { event: Event }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
  };

  return (
    <Link
      href={`/events/${event.id}`}
      className="
        group flex-shrink-0 w-72 bg-bg-secondary rounded-2xl overflow-hidden shadow-sm
        border border-border-secondary
        hover:border-brand-300 dark:hover:border-brand-600 
        hover:shadow-xl hover:shadow-brand-500/10
        hover:-translate-y-1
        transition-all duration-300
        focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
      "
    >
      <div className="relative h-32 bg-bg-tertiary overflow-hidden">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt=""
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 via-brand-200 to-brand-300 dark:from-brand-900 dark:via-brand-800 dark:to-brand-700" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Date badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-sm">
          <p className="text-xs font-bold text-brand-600 dark:text-brand-400">{formatDate(event.date)}</p>
        </div>

        {/* Coin reward */}
        {event.coinReward > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full text-white text-xs font-bold shadow-md">
            <Coin size={12} weight="fill" />
            +{event.coinReward}
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-fg-primary truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {event.title}
        </h4>
        <p className="text-sm text-fg-tertiary mt-1.5 flex items-center gap-1.5">
          <MapPin size={14} weight="fill" className="text-fg-quaternary" />
          <span className="truncate">{event.location}</span>
        </p>
      </div>
    </Link>
  );
}

export default EventCard;
