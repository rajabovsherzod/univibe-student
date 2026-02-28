'use client';

import { type ReactNode, type ComponentProps } from 'react';
import {
  CalendarBlank,
  Bell,
  Trophy,
  Users,
  Info,
  MapPin,
  Tag as TagIcon,
  Clock,
  Star,
  ArrowRight,
  User,
  Coin,
  CaretRight,
} from '@phosphor-icons/react';

// Icon name to component mapping
const iconMap = {
  calendar: CalendarBlank,
  bell: Bell,
  trophy: Trophy,
  users: Users,
  info: Info,
  'map-pin': MapPin,
  tag: TagIcon,
  clock: Clock,
  star: Star,
  'arrow-right': ArrowRight,
  user: User,
  coin: Coin,
  'caret-right': CaretRight,
};

export type IconName = keyof typeof iconMap;

// Size variants
type IconWrapperSize = 'sm' | 'md' | 'lg';

interface IconWrapperProps {
  iconName: IconName;
  size?: IconWrapperSize;
  className?: string;
}

const sizeClasses: Record<IconWrapperSize, { wrapper: string; icon: number }> = {
  sm: { wrapper: 'w-7 h-7 rounded-lg', icon: 14 },
  md: { wrapper: 'w-8 h-8 rounded-lg', icon: 16 },
  lg: { wrapper: 'w-10 h-10 rounded-xl', icon: 20 },
};

export function IconWrapper({ iconName, size = 'md', className = '' }: IconWrapperProps) {
  const IconComponent = iconMap[iconName];
  const sizeClass = sizeClasses[size];

  return (
    <span className={`
      flex items-center justify-center ${sizeClass.wrapper}
      bg-gradient-to-br from-brand-500 to-brand-600
      dark:from-brand-400 dark:to-brand-500
      shadow-md shadow-brand-500/25
      ${className}
    `}>
      <IconComponent
        size={sizeClass.icon}
        weight="fill"
        className="text-white"
      />
    </span>
  );
}

// Arrow button for cards - Premium pill style
interface ViewArrowProps {
  size?: IconWrapperSize;
  className?: string;
}

export function ViewArrow({ size = 'md', className = '' }: ViewArrowProps) {
  const sizeClass = sizeClasses[size];

  return (
    <span className={`
      flex items-center justify-center ${sizeClass.wrapper}
      bg-gradient-to-br from-brand-500 to-brand-600
      dark:from-brand-400 dark:to-brand-500
      shadow-md shadow-brand-500/25
      group-hover:shadow-lg group-hover:shadow-brand-500/30
      transition-all duration-300
      ${className}
    `}>
      <ArrowRight
        size={sizeClass.icon}
        weight="bold"
        className="text-white group-hover:translate-x-0.5 transition-transform"
      />
    </span>
  );
}

export default IconWrapper;
