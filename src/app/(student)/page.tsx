import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { HomeHeader } from '@/components/student/PageHeader';
import { getDashboardBanners } from '@/lib/api/banners-ssr';
import BannersSliderWrapper from './banners-slider-wrapper';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const studentName = session?.user?.name || 'Talaba';
  
  // Fetch banners on server-side
  const banners = await getDashboardBanners();

  return (
    <div className="space-y-6 pb-10">
      <HomeHeader studentName={studentName} />
      
      {/* ── BANNER SLIDER (SSR data → Client Component) ── */}
      <BannersSliderWrapper banners={banners} />
    </div>
  );
}
