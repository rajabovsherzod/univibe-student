'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Banner } from '@/types/banners';

interface BannerCardProps {
  banner: Banner;
  isMobile?: boolean;
}

/**
 * BannerCard - Student portal uchun banner card
 */
export function BannerCard({ banner, isMobile = false }: BannerCardProps) {
  // Mobile image priority, fallback to desktop image
  const imageSrc = isMobile && banner.mobile_image 
    ? banner.mobile_image 
    : banner.image;
  
  return (
    <div className="relative w-full h-[200px] sm:h-[300px] md:h-[350px] overflow-hidden rounded-xl bg-bg-primary">
      {/* Banner Image with Scale Effect */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={banner.title || 'Banner'}
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 100vw"
        />
      </div>
      
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
      
      {/* Content Container */}
      {(banner.title || banner.subtitle || banner.cta_text) && (
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 flex flex-col items-start gap-2 sm:gap-3">
          {/* Title */}
          {banner.title && (
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-2xl">
              {banner.title}
            </h2>
          )}
          
          {/* Subtitle */}
          {banner.subtitle && (
            <p className="text-sm sm:text-base md:text-lg text-gray-100 line-clamp-2 max-w-3xl drop-shadow-lg">
              {banner.subtitle}
            </p>
          )}
          
          {/* CTA Button */}
          {banner.cta_text && banner.cta_link && (
            <Link
              href={banner.cta_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-1 sm:mt-2"
            >
              {banner.cta_text}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
