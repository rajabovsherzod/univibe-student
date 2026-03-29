'use client';

import { BannersSlider } from '@/components/student/BannersSlider';
import type { Banner } from '@/types/banners';

interface BannersSliderWrapperProps {
  banners: Banner[];
}

/**
 * Client wrapper for SSR BannersSlider
 * Passes server-fetched banners to client component
 */
export default function BannersSliderWrapper({ banners }: BannersSliderWrapperProps) {
  return <BannersSlider banners={banners} />;
}
