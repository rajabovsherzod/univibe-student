'use client';

import Link from 'next/link';
import { ArrowRight, CalendarBlank, Bell, Trophy, Users, Info, MapPin, Tag, Clock, Star } from '@phosphor-icons/react';
import { type ReactNode } from 'react';

// Icon name to component mapping
const iconMap = {
  calendar: CalendarBlank,
  bell: Bell,
  trophy: Trophy,
  users: Users,
  info: Info,
  'map-pin': MapPin,
  tag: Tag,
  clock: Clock,
  star: Star,
};

type IconName = keyof typeof iconMap;

interface SectionHeaderProps {
  title: string;
  iconName?: IconName;
  viewAllHref?: string;
  viewAllText?: string;
  children?: ReactNode;
}

export function SectionHeader({
  title,
  iconName,
  viewAllHref,
  viewAllText = 'View all',
  children
}: SectionHeaderProps) {
  const IconComponent = iconName ? iconMap[iconName] : null;

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {/* Premium glassmorphism icon wrapper */}
        {IconComponent && (
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-brand-500/20 dark:bg-brand-400/20 rounded-xl blur-md" />

            {/* Icon container */}
            <span className="
              relative flex items-center justify-center w-10 h-10 rounded-xl
              bg-gradient-to-br from-brand-500 to-brand-600
              dark:from-brand-400 dark:to-brand-500
              shadow-lg shadow-brand-500/30
            ">
              <IconComponent
                size={20}
                weight="fill"
                className="text-white"
              />
            </span>
          </div>
        )}

        {/* Title with subtle gradient */}
        <h2 className="text-lg font-bold text-fg-primary">
          {title}
        </h2>
      </div>

      {/* View All Link or Custom Children */}
      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className="
            group flex items-center gap-1.5 text-sm font-semibold
            text-brand-600 dark:text-brand-400
            px-4 py-2 rounded-full
            bg-brand-50 dark:bg-brand-950
            border border-brand-200 dark:border-brand-800
            hover:bg-brand-100 dark:hover:bg-brand-900
            hover:border-brand-300 dark:hover:border-brand-700
            shadow-sm
            transition-all duration-200
          "
        >
          {viewAllText}
          <ArrowRight
            size={14}
            weight="bold"
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      ) : children}
    </div>
  );
}

// Smaller variant for inside cards - also premium
interface SectionTitleProps {
  title: string;
  iconName?: IconName;
  className?: string;
}

export function SectionTitle({ title, iconName, className = '' }: SectionTitleProps) {
  const IconComponent = iconName ? iconMap[iconName] : null;

  return (
    <h2 className={`text-lg font-bold text-fg-primary mb-4 flex items-center gap-2.5 ${className}`}>
      {IconComponent && (
        <span className="
          flex items-center justify-center w-8 h-8 rounded-lg
          bg-gradient-to-br from-brand-500 to-brand-600
          dark:from-brand-400 dark:to-brand-500
          shadow-md shadow-brand-500/25
        ">
          <IconComponent
            size={16}
            weight="fill"
            className="text-white"
          />
        </span>
      )}
      {title}
    </h2>
  );
}

export default SectionHeader;
