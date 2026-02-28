import { getStudent, getAnnouncements, getEvents } from '@/lib/api/student';
import { AnnouncementCard } from '@/components/student/AnnouncementCard';
import { EventsSwiper } from '@/components/student/EventsSwiper';
import { HomeHeader } from '@/components/student/PageHeader';
import { SectionHeader } from '@/components/student/SectionHeader';

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
        <SectionHeader
          title="Upcoming Events"
          iconName="calendar"
          viewAllHref="/events"
        />
        <EventsSwiper events={upcomingEvents} />
      </section>

      {/* Announcements */}
      <section>
        <SectionHeader
          title="Latest Announcements"
          iconName="bell"
        />
        <div className="space-y-3">
          {regularAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      </section>
    </div>
  );
}
