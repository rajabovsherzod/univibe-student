'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import Link from 'next/link';
import { CalendarBlank, MapPin, Coin, ArrowRight } from '@phosphor-icons/react';
import { type Event } from '@/types/student';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

interface EventsSwiperProps {
  events: Event[];
}

export function EventsSwiper({ events }: EventsSwiperProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
  };

  return (
    <div className="relative events-swiper">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={16}
        slidesPerView={1.2}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        breakpoints={{
          480: {
            slidesPerView: 1.5,
            spaceBetween: 16,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2.5,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
          1280: {
            slidesPerView: 3.5,
            spaceBetween: 24,
          },
        }}
        className="!pb-12"
      >
        {events.map((event) => (
          <SwiperSlide key={event.id}>
            <Link
              href={`/events/${event.id}`}
              className="
                group block bg-bg-secondary rounded-2xl overflow-hidden shadow-sm
                border border-border-secondary
                hover:border-brand-300 dark:hover:border-brand-600 
                hover:shadow-xl hover:shadow-brand-500/10
                transition-all duration-300
              "
            >
              <div className="relative h-36 sm:h-40 bg-bg-tertiary overflow-hidden">
                {event.coverImage ? (
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-100 via-brand-200 to-brand-300 dark:from-brand-900 dark:via-brand-800 dark:to-brand-700" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Date badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-sm">
                  <p className="text-xs font-bold text-brand-600 dark:text-brand-400">{formatDate(event.date)}</p>
                </div>

                {/* Coin reward */}
                {event.coinReward > 0 && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full text-white text-xs font-bold shadow-md">
                    <Coin size={12} weight="fill" />
                    +{event.coinReward}
                  </div>
                )}

                {/* Title on image */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="font-semibold text-white text-sm sm:text-base line-clamp-2 drop-shadow-sm">
                    {event.title}
                  </h4>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-fg-secondary flex items-center gap-1.5 truncate">
                    <MapPin size={14} weight="fill" className="text-fg-quaternary flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </p>
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-50 dark:bg-brand-950 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900 transition-colors">
                    <ArrowRight size={14} weight="bold" className="text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .events-swiper .swiper-button-prev,
        .events-swiper .swiper-button-next {
          width: 36px;
          height: 36px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-secondary);
          border-radius: 50%;
          color: var(--fg-secondary);
          transition: all 0.2s;
        }
        .events-swiper .swiper-button-prev:hover,
        .events-swiper .swiper-button-next:hover {
          background: var(--bg-tertiary);
          color: var(--fg-primary);
          border-color: var(--border-brand);
        }
        .events-swiper .swiper-button-prev::after,
        .events-swiper .swiper-button-next::after {
          font-size: 14px;
          font-weight: bold;
        }
        .events-swiper .swiper-pagination-bullet {
          background: var(--fg-quaternary);
          opacity: 1;
        }
        .events-swiper .swiper-pagination-bullet-active {
          background: var(--brand-600);
          width: 20px;
          border-radius: 4px;
        }
        @media (max-width: 640px) {
          .events-swiper .swiper-button-prev,
          .events-swiper .swiper-button-next {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default EventsSwiper;
