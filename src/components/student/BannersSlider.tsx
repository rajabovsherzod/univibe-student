'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { BannerCard } from './BannerCard';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import type { Banner } from '@/types/banners';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface BannersSliderProps {
  banners: Banner[];
}

/**
 * BannersSlider - Carousel slider for dashboard banners
 * 
 * Features:
 * - Auto-play every 5 seconds
 * - Pagination dots (bottom center)
 * - Fade effect between slides
 * - Responsive (mobile image support)
 * - No loading skeleton (SSR)
 */
export function BannersSlider({ banners }: BannersSliderProps) {
  // Use 'sm' breakpoint (640px) for mobile detection
  const isMobile = !useBreakpoint('sm');
  
  // No banners - hide component
  if (!banners?.length) {
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
        {banners.map((banner) => (
          <SwiperSlide key={banner.public_id}>
            <BannerCard banner={banner} isMobile={isMobile} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
