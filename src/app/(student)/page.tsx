import Link from 'next/link';
import {
  ArrowRight,
  CalendarBlank,
  Bell
} from '@phosphor-icons/react/dist/ssr';
import { getStudent, getAnnouncements, getEvents } from '@/lib/api/student';
import { AnnouncementCard } from '@/components/student/AnnouncementCard';
import { EventsSwiper } from '@/components/student/EventsSwiper';
import { HomeHeader } from '@/components/student/PageHeader';

export default async function HomePage() {
  const [student, announcements, events] = await Promise.all([
    getStudent(),
    getAnnouncements(),
    getEvents({ sortBy: 'date' }),
  ]);

  const regularAnnouncements = announcements.filter(a => !a.isPinned).slice(0, 3);
  const upcomingEvents = events.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <HomeHeader
        studentName={student.name}
        coins={student.coins}
        rank={student.rank}
        previousRank={student.previousRank}
      />

      {/* Upcoming Events Carousel */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-fg-primary flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900">
              <CalendarBlank size={18} weight="fill" className="text-brand-600 dark:text-brand-400" />
            </span>
            Upcoming Events
          </h2>
          <Link
            href="/events"
            className="
              text-sm font-medium text-brand-600 dark:text-brand-400
              flex items-center gap-1.5
              hover:underline underline-offset-2
              transition-all
            "
          >
            View all
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
        <EventsSwiper events={upcomingEvents} />
      </section>

      {/* Announcements */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-fg-primary flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900">
              <Bell size={18} weight="fill" className="text-brand-600 dark:text-brand-400" />
            </span>
            Latest Announcements
          </h2>
        </div>
        <div className="space-y-3">
          {regularAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      </section>
    </div>
  );
}
