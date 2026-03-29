'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { useBanners } from '@/hooks/api/use-banners';
import { BannerCard } from './BannerCard';
import { useBreakpoint } from '@/hooks/use-breakpoint';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

/**
 * BannersSlider - Carousel slider for dashboard banners
 * 
 * Features:
 * - Auto-play every 5 seconds
 * - Pagination dots (bottom center)
 * - Fade effect between slides
 * - Responsive (mobile image support)
 * - Loading skeleton
 * - Empty state handling
 */
export function BannersSlider() {
  const { data, isLoading } = useBanners();
  // Use 'sm' breakpoint (640px) for mobile detection
  const isMobile = !useBreakpoint('sm');
  
  // Loading state - show skeleton
  if (isLoading) {
    return (
      <div className="w-full h-[200px] sm:h-[300px] md:h-[350px] bg-bg-secondary animate-pulse rounded-xl" />
    );
  }
  
  // No banners - hide component
  if (!data?.results?.length) {
    return null;
  }
  
  return (
    <div className="w-full mb-6">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        speed={500}
        className="mySwiper"
      >
        {data.results.map((banner) => (
          <SwiperSlide key={banner.public_id}>
            <BannerCard banner={banner} isMobile={isMobile} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
