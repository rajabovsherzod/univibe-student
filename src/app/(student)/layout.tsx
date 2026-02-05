import { getStudent, getUnreadNotificationCount } from '@/lib/api/student';
import { StudentShell } from '@/components/student/StudentShell';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [student, unreadCount] = await Promise.all([
    getStudent(),
    getUnreadNotificationCount(),
  ]);

  return (
    <StudentShell
      student={{
        name: student.name,
        coins: student.coins,
        rank: student.rank,
        previousRank: student.previousRank,
        avatar: student.avatar,
      }}
      unreadNotifications={unreadCount}
    >
      {children}
    </StudentShell>
  );
}
