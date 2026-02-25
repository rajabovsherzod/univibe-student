'use client';

import Link from 'next/link';
import Lottie from 'lottie-react';
import animationData from '../../public/animations/404-animation.json';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-8">
      {/* Animation Container */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
      </div>

      {/* Text Content */}
      <div className="text-center mt-6 sm:mt-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-fg-primary mb-3">
          Page Not Found
        </h1>

        {/* Back Button */}
        <Link
          href="/"
          className="
            inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4
            bg-brand-600 hover:bg-brand-700
            text-white font-semibold text-base sm:text-lg
            rounded-xl shadow-lg shadow-brand-500/30
            hover:shadow-xl hover:shadow-brand-500/40
            hover:-translate-y-0.5
            transition-all duration-300
            focus-visible:ring-4 focus-visible:ring-brand-300
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
