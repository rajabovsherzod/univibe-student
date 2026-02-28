'use client';

import { type ReactNode } from 'react';
import {
  Trophy, Wallet, Storefront, CalendarBlank,
  CalendarCheck, Bell, User, House
} from '@phosphor-icons/react';

const iconMap = {
  trophy: Trophy, wallet: Wallet, storefront: Storefront,
  calendar: CalendarBlank, 'calendar-check': CalendarCheck,
  bell: Bell, user: User, house: House,
};

type IconName = keyof typeof iconMap;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  iconName?: IconName;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, iconName, children }: PageHeaderProps) {
  const IconComponent = iconName ? iconMap[iconName] : null;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-6 sm:p-8 mb-6">
      {IconComponent && (
        <div className="absolute -right-4 -top-4 sm:-right-2 sm:-top-2 opacity-[0.10] pointer-events-none select-none">
          <IconComponent size={160} weight="fill" className="text-brand-400 transform rotate-12" />
        </div>
      )}
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-fg-primary">{title}</h1>
            {subtitle && <p className="text-fg-tertiary mt-1.5 text-sm sm:text-base max-w-lg">{subtitle}</p>}
          </div>
          {children && <div className="flex items-center gap-3 flex-shrink-0">{children}</div>}
        </div>
      </div>
    </div>
  );
}

interface HomeHeaderProps { studentName: string }

export function HomeHeader({ studentName }: HomeHeaderProps) {
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 6)  return 'Xayrli kech';
    if (h < 12) return 'Xayrli tong';
    if (h < 18) return 'Xayrli kun';
    return 'Xayrli oqshom';
  };

  const firstName = studentName.split(' ')[0];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-6 sm:p-8 mb-6">
      <div className="absolute -right-4 -top-4 sm:-right-2 sm:-top-2 opacity-[0.10] pointer-events-none select-none">
        <House size={160} weight="fill" className="text-brand-400 transform rotate-12" />
      </div>
      <div className="relative z-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-fg-primary">
          {getGreeting()}, {firstName}! 👋
        </h1>
        <p className="text-fg-tertiary mt-1 text-sm sm:text-base">
          Bugun universitetingizda nima bo&apos;layotgani bilan tanishing
        </p>
      </div>
    </div>
  );
}

export default PageHeader;
