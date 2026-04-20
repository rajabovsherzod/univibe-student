import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { StudentShell } from '@/components/student/StudentShell';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  // Middleware allaqachon authentication'ni tekshiradi
  // Bu yerda faqat session mavjudligini tasdiqlash kifoya
  if (!session) {
    redirect('/login');
  }

  return <StudentShell>{children}</StudentShell>;
}
