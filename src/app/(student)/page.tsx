import Link from 'next/link';
import { Calendar, Trophy, ShoppingBag, ArrowRight, Megaphone } from 'lucide-react';
import { getStudent, getAnnouncements, getEvents } from '@/lib/api/student';
import { AnnouncementCard, PinnedAnnouncementBanner } from '@/components/student/AnnouncementCard';
import { EventCarouselCard } from '@/components/student/EventCard';
import { CoinPill } from '@/components/student/CoinPill';
import { RankChip } from '@/components/student/RankChip';

export default async function HomePage() {
  const [student, announcements, events] = await Promise.all([
    getStudent(),
    getAnnouncements(),
    getEvents({ sortBy: 'date' }),
  ]);

  const pinnedAnnouncement = announcements.find(a => a.isPinned);
  const regularAnnouncements = announcements.filter(a => !a.isPinned).slice(0, 3);
  const upcomingEvents = events.slice(0, 6);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Header with Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-fg-primary">
            {getGreeting()}, {student.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-fg-secondary mt-1">
            Here&apos;s what&apos;s happening at your university
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CoinPill amount={student.coins} size="md" />
          <RankChip rank={student.rank} previousRank={student.previousRank} size="md" />
        </div>
      </div>

      {/* Pinned Announcement */}
      {pinnedAnnouncement && (
        <PinnedAnnouncementBanner announcement={pinnedAnnouncement} />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickActionCard
          href="/my-events"
          icon={Calendar}
          title="My Events"
          description="View your registered events"
          color="brand"
        />
        <QuickActionCard
          href="/leaderboard"
          icon={Trophy}
          title="Leaderboard"
          description={`You're ranked #${student.rank}`}
          color="amber"
        />
        <QuickActionCard
          href="/shop"
          icon={ShoppingBag}
          title="Shop"
          description="Redeem your coins"
          color="success"
        />
      </div>

      {/* Upcoming Events Carousel */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-fg-primary flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-500" />
            Upcoming Events
          </h2>
          <Link
            href="/events"
            className="
              text-sm font-medium text-brand-600 dark:text-brand-400
              flex items-center gap-1 hover:gap-2 transition-all
              focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900 rounded
            "
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {upcomingEvents.map((event) => (
            <EventCarouselCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-fg-primary flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-brand-500" />
            Latest Announcements
          </h2>
        </div>
        <div className="space-y-4">
          {regularAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      </section>
    </div>
  );
}

// Quick Action Card Component
interface QuickActionCardProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: 'brand' | 'amber' | 'success';
}

function QuickActionCard({ href, icon: Icon, title, description, color }: QuickActionCardProps) {
  const colorStyles = {
    brand: 'from-brand-50 to-brand-100 dark:from-brand-950 dark:to-brand-900 border-brand-200 dark:border-brand-800 hover:border-brand-300 dark:hover:border-brand-700',
    amber: 'from-amber-50 to-yellow-100 dark:from-amber-950 dark:to-yellow-900 border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700',
    success: 'from-success-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700',
  };

  const iconColors = {
    brand: 'text-brand-600 dark:text-brand-400',
    amber: 'text-amber-600 dark:text-amber-400',
    success: 'text-success-600 dark:text-success-400',
  };

  return (
    <Link
      href={href}
      className={`
        group flex items-center gap-4 p-5 rounded-xl
        bg-gradient-to-br ${colorStyles[color]}
        border transition-all duration-200
        hover:shadow-md
        focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
      `}
    >
      <div className={`
        w-12 h-12 rounded-xl flex items-center justify-center
        bg-white/60 dark:bg-black/20 ${iconColors[color]}
      `}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-fg-primary group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-fg-secondary truncate">{description}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-fg-tertiary group-hover:text-fg-secondary group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
