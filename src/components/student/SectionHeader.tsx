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
      <h2 className="text-lg font-semibold text-fg-primary flex items-center gap-3">
        {/* Premium icon wrapper */}
        {IconComponent && (
          <span className="
            flex items-center justify-center w-9 h-9 rounded-xl
            bg-gradient-to-br from-brand-50 to-brand-100
            dark:from-brand-950 dark:to-brand-900
            border border-brand-200/50 dark:border-brand-800/50
            shadow-sm
          ">
            <IconComponent
              size={18}
              weight="fill"
              className="text-brand-600 dark:text-brand-400"
            />
          </span>
        )}
        {title}
      </h2>

      {/* View All Link or Custom Children */}
      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className="
            text-sm font-medium text-brand-600 dark:text-brand-400
            flex items-center gap-1.5
            px-3 py-1.5 rounded-lg
            hover:bg-brand-50 dark:hover:bg-brand-950
            transition-all duration-200
          "
        >
          {viewAllText}
          <ArrowRight size={14} weight="bold" />
        </Link>
      ) : children}
    </div>
  );
}

// Smaller variant for inside cards
interface SectionTitleProps {
  title: string;
  iconName?: IconName;
  className?: string;
}

export function SectionTitle({ title, iconName, className = '' }: SectionTitleProps) {
  const IconComponent = iconName ? iconMap[iconName] : null;

  return (
    <h2 className={`text-lg font-semibold text-fg-primary mb-4 flex items-center gap-2 ${className}`}>
      {IconComponent && (
        <span className="
          flex items-center justify-center w-7 h-7 rounded-lg
          bg-brand-50 dark:bg-brand-950
          border border-brand-100 dark:border-brand-900
        ">
          <IconComponent
            size={14}
            weight="fill"
            className="text-brand-600 dark:text-brand-400"
          />
        </span>
      )}
      {title}
    </h2>
  );
}

export default SectionHeader;
