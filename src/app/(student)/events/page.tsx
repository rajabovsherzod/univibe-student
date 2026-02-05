'use client';

import { useState, useEffect } from 'react';
import { getEvents } from '@/lib/api/student';
import { type Event, type EventCategory, type EventStatus, type EventFilters } from '@/types/student';
import { EventCard } from '@/components/student/EventCard';
import { FilterBar, QuickFilters } from '@/components/student/FilterBar';
import { NoEventsFound, NoSearchResults } from '@/components/student/EmptyState';
import { EventCardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/student/PageHeader';

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'academic', label: 'Academic' },
  { value: 'sports', label: 'Sports' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'career', label: 'Career' },
  { value: 'social', label: 'Social' },
  { value: 'volunteer', label: 'Volunteer' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'registered', label: 'Registered' },
  { value: 'closed', label: 'Closed' },
];

const sortOptions = [
  { value: 'date', label: 'Soonest First' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    loadEvents();
  }, [searchQuery, categoryFilter, statusFilter, sortBy]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const filters: EventFilters = {
        search: searchQuery || undefined,
        category: categoryFilter && categoryFilter !== 'all' ? categoryFilter as EventCategory : undefined,
        status: statusFilter !== 'all' ? statusFilter as EventStatus : undefined,
        sortBy: sortBy as 'date' | 'newest' | 'popular',
      };
      const data = await getEvents(filters);
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterId: string, value: string | null) => {
    if (filterId === 'category') {
      setCategoryFilter(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Events"
        subtitle="Discover and register for upcoming university events"
        iconName="calendar"
      />

      {/* Status Quick Filters */}
      <QuickFilters
        options={statusOptions}
        value={statusFilter}
        onChange={(value) => setStatusFilter(value)}
      />

      {/* Search, Filters & Sort */}
      <FilterBar
        searchPlaceholder="Search events..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            id: 'category',
            label: 'Category',
            options: categoryOptions,
            value: categoryFilter,
          },
        ]}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        sortValue={sortBy}
        onSortChange={setSortBy}
      />

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Events Grid */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Empty States */}
      {!loading && events.length === 0 && searchQuery && (
        <NoSearchResults query={searchQuery} />
      )}
      {!loading && events.length === 0 && !searchQuery && (
        <NoEventsFound />
      )}
    </div>
  );
}
