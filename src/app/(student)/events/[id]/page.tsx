'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  Coins,
  Award,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { getEvent, getSimilarEvents, registerForEvent, cancelRegistration } from '@/lib/api/student';
import { type Event } from '@/types/student';
import { Button } from '@/components/ui/Button';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import { PremiumConfirmModal, SuccessModal } from '@/components/ui/Modal';
import { EventCard } from '@/components/student/EventCard';
import { CoinPill } from '@/components/student/CoinPill';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [similarEvents, setSimilarEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const eventData = await getEvent(eventId);
      if (eventData) {
        setEvent(eventData);
        const similar = await getSimilarEvents(eventId, eventData.category);
        setSimilarEvents(similar);
      }
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!event) return;
    setIsRegistering(true);
    try {
      const result = await registerForEvent(event.id);
      if (result.success) {
        setEvent({ ...event, status: 'registered', registeredCount: event.registeredCount + 1 });
        setShowConfirmModal(false);
        setShowSuccessModal(true);
        toast.success('Successfully registered for event!');
      } else {
        toast.error(result.error || 'Failed to register');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!event) return;
    setIsRegistering(true);
    try {
      const result = await cancelRegistration(event.id);
      if (result.success) {
        setEvent({ ...event, status: 'open', registeredCount: event.registeredCount - 1 });
        setShowCancelModal(false);
        toast.success('Registration cancelled');
      } else {
        toast.error(result.error || 'Failed to cancel');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsRegistering(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDeadline = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <EventDetailsSkeleton />;
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-fg-primary mb-2">Event not found</h2>
        <p className="text-fg-secondary mb-6">The event you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  const spotsLeft = event.capacity - event.registeredCount;
  const isFull = spotsLeft <= 0;
  const isRegistered = event.status === 'registered';
  const isClosed = event.status === 'closed';

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href="/events"
        className="
          inline-flex items-center gap-2 text-sm text-fg-secondary
          hover:text-fg-primary transition-colors
          focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900 rounded
        "
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-48 sm:h-64 lg:h-80 object-cover"
          />
        ) : (
          <div className="w-full h-48 sm:h-64 lg:h-80 bg-gradient-to-br from-brand-400 to-brand-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusBadge status={event.status} />
            <CategoryBadge category={event.category} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {event.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-bg-secondary rounded-xl border border-border-secondary shadow-sm p-6">
            <h2 className="text-lg font-semibold text-fg-primary mb-4">About This Event</h2>
            <p className="text-fg-secondary leading-relaxed">{event.description}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm rounded-full bg-bg-tertiary text-fg-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Rewards Section */}
          {(event.coinReward > 0 || event.badgeReward) && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
              <h2 className="text-lg font-semibold text-fg-primary mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Rewards for Attendance
              </h2>
              <div className="flex flex-wrap gap-4">
                {event.coinReward > 0 && (
                  <div className="flex items-center gap-3 bg-white dark:bg-black/20 rounded-lg px-4 py-3">
                    <Coins className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        +{event.coinReward}
                      </p>
                      <p className="text-sm text-fg-tertiary">coins</p>
                    </div>
                  </div>
                )}
                {event.badgeReward && (
                  <div className="flex items-center gap-3 bg-white dark:bg-black/20 rounded-lg px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                      🏆
                    </div>
                    <div>
                      <p className="font-semibold text-fg-primary">{event.badgeReward}</p>
                      <p className="text-sm text-fg-tertiary">badge</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Details Card */}
          <div className="bg-bg-secondary rounded-xl border border-border-secondary shadow-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-fg-tertiary">Date</p>
                <p className="font-medium text-fg-primary">{formatDate(event.date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-fg-tertiary">Time</p>
                <p className="font-medium text-fg-primary">
                  {event.startTime} - {event.endTime}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-fg-tertiary">Location</p>
                <p className="font-medium text-fg-primary">{event.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-fg-tertiary">Organizer</p>
                <p className="font-medium text-fg-primary">{event.organizer}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-fg-tertiary">Capacity</p>
                <p className={`font-medium ${isFull ? 'text-error-600 dark:text-error-400' : 'text-fg-primary'}`}>
                  {event.registeredCount} / {event.capacity} registered
                  {!isFull && ` (${spotsLeft} spots left)`}
                </p>
              </div>
            </div>

            {/* Registration Deadline */}
            <div className="pt-4 border-t border-border-secondary">
              <p className="text-sm text-fg-tertiary mb-1">Registration Deadline</p>
              <p className="font-medium text-fg-primary">
                {formatDeadline(event.registrationDeadline)}
              </p>
            </div>
          </div>

          {/* CTA Card */}
          <div className="bg-bg-secondary rounded-xl border border-border-secondary shadow-sm p-6">
            {isRegistered ? (
              <>
                <div className="flex items-center gap-2 text-success-600 dark:text-success-400 mb-4">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">You're registered!</span>
                </div>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Registration
                </Button>
              </>
            ) : isClosed || isFull ? (
              <>
                <div className="flex items-center gap-2 text-fg-tertiary mb-4">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {isFull ? 'Event is full' : 'Registration closed'}
                  </span>
                </div>
                <Button variant="secondary" fullWidth disabled>
                  Registration Unavailable
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                fullWidth
                onClick={() => setShowConfirmModal(true)}
              >
                Register for Event
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Similar Events */}
      {similarEvents.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-fg-primary mb-4">
            Similar Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {/* Confirm Registration Modal */}
      <PremiumConfirmModal
        isOpen={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title="Register for Event"
        description={`Are you sure you want to register for "${event.title}"? You'll earn ${event.coinReward} coins after attending.`}
        confirmText="Register"
        onConfirm={handleRegister}
        isLoading={isRegistering}
        icon={<Calendar className="w-6 h-6" />}
      />

      {/* Cancel Registration Modal */}
      <PremiumConfirmModal
        isOpen={showCancelModal}
        onOpenChange={setShowCancelModal}
        title="Cancel Registration"
        description={`Are you sure you want to cancel your registration for "${event.title}"?`}
        confirmText="Cancel Registration"
        cancelText="Keep Registration"
        variant="danger"
        onConfirm={handleCancelRegistration}
        isLoading={isRegistering}
        icon={<XCircle className="w-6 h-6" />}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title="Registration Successful!"
        description={`You're registered for "${event.title}". Don't forget to attend and earn your coins!`}
        icon={<CheckCircle className="w-6 h-6" />}
      />
    </div>
  );
}

function EventDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
