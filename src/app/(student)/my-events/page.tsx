'use client';

import { useState, useEffect } from 'react';
import { getMyEvents } from '@/lib/api/student';
import { type Event } from '@/types/student';
import { EventCard } from '@/components/student/EventCard';
import { QuickFilters } from '@/components/student/FilterBar';
import { NoRegisteredEvents } from '@/components/student/EmptyState';
import { EventCardSkeleton } from '@/components/ui/Skeleton';
import { Coins } from 'lucide-react';

const tabOptions = [
  { value: 'registered', label: 'Registered' },
  { value: 'attended', label: 'Attended' },
  { value: 'past', label: 'Past' },
];

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registered');

  useEffect(() => {
    loadEvents();
  }, [activeTab]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getMyEvents(activeTab as 'registered' | 'attended' | 'past');
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-fg-primary">My Events</h1>
        <p className="text-fg-secondary mt-1">
          Track your event registrations and attendance
        </p>
      </div>

      {/* Tabs */}
      <QuickFilters
        options={tabOptions}
        value={activeTab}
        onChange={setActiveTab}
      />

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Events Grid */}
      {!loading && events.length > 0 && (
        <div className="space-y-6">
          {activeTab === 'attended' && (
            <div className="bg-success-50 dark:bg-success-900/20 rounded-xl border border-success-200 dark:border-success-800 p-4">
              <p className="text-success-700 dark:text-success-300 text-sm flex items-center gap-2">
                <Coins className="w-4 h-4" />
                You've earned coins from these events! Check your wallet for details.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <NoRegisteredEvents />
      )}
    </div>
  );
}
