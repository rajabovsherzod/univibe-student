import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAnnouncements, getEvents } from '@/lib/api/student';
import { AnnouncementCard } from '@/components/student/AnnouncementCard';
import { EventsSwiper } from '@/components/student/EventsSwiper';
import { HomeHeader } from '@/components/student/PageHeader';
import { SectionHeader } from '@/components/student/SectionHeader';

export default async function HomePage() {
  const [session, announcements, events] = await Promise.all([
    getServerSession(authOptions),
    getAnnouncements(),
    getEvents({ sortBy: 'date' }),
  ]);

  const regularAnnouncements = announcements.filter(a => !a.isPinned).slice(0, 3);
  const upcomingEvents = events.slice(0, 8);
  const studentName = session?.user?.name || 'Talaba';

  return (
    <div className="space-y-8">
      <HomeHeader studentName={studentName} />

      <section>
        <SectionHeader title="Yaqinlashayotgan tadbirlar" iconName="calendar" viewAllHref="/events" />
        <EventsSwiper events={upcomingEvents} />
      </section>

      <section>
        <SectionHeader title="So'nggi e'lonlar" iconName="bell" />
        <div className="space-y-3">
          {regularAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      </section>
    </div>
  );
}
