import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { HomeHeader } from '@/components/student/PageHeader';
import { BannersSlider } from '@/components/student/BannersSlider';
import { CalendarBlankIcon } from '@phosphor-icons/react/dist/ssr';
import { FeatureComingSoon } from '@/components/student/FeatureComingSoon';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const studentName = session?.user?.name || 'Talaba';

  return (
    <div className="space-y-6 pb-10">
      <HomeHeader studentName={studentName} />
      
      {/* ── BANNER SLIDER ── */}
      <BannersSlider />
      
      <FeatureComingSoon
        iconName="calendar"
        translationKey="home"
      />
    </div>
  );
}
