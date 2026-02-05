'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House,
  CalendarBlank,
  Trophy,
  Storefront,
  User,
  Bell,
  Moon,
  Sun,
  Wallet,
  CalendarCheck,
} from '@phosphor-icons/react';
import { CoinPill } from './CoinPill';
import { RankChip } from './RankChip';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

interface StudentShellProps {
  children: React.ReactNode;
  student?: {
    name: string;
    coins: number;
    rank: number;
    previousRank?: number;
    avatar?: string;
  };
  unreadNotifications?: number;
}

// Navigation items with Phosphor icons
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; weight?: 'regular' | 'fill' | 'bold' }>;
}

interface NavDivider {
  divider: true;
}

type NavConfigItem = NavItem | NavDivider;

const mainNavItems: NavConfigItem[] = [
  { href: '/', label: 'Home', icon: House },
  { href: '/events', label: 'Events', icon: CalendarBlank },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/shop', label: 'Shop', icon: Storefront },
  { divider: true },
  { href: '/my-events', label: 'My Events', icon: CalendarCheck },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { divider: true },
  { href: '/profile', label: 'Profile', icon: User },
];

// Mobile bottom dock items
const mobileNavItems: NavItem[] = [
  { href: '/', label: 'Home', icon: House },
  { href: '/events', label: 'Events', icon: CalendarBlank },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/shop', label: 'Shop', icon: Storefront },
  { href: '/profile', label: 'Profile', icon: User },
];

export function StudentShell({
  children,
  student,
  unreadNotifications = 0,
}: StudentShellProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Desktop Sidebar - Untitled UI Style */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-[280px] lg:flex-col">
        <div className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-border-secondary bg-bg-secondary px-4 py-6">
          {/* Logo */}
          <div className="flex h-10 shrink-0 items-center px-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-base">U</span>
              </div>
              <span className="text-lg font-semibold text-fg-primary">
                Univibe<span className="text-brand-600">Student</span>
              </span>
            </Link>
          </div>

          {/* User Info Card */}
          {student && (
            <div className="mx-2 p-4 rounded-xl bg-bg-tertiary border border-border-secondary">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900 flex-shrink-0 ring-2 ring-bg-secondary shadow-sm">
                  {student.avatar ? (
                    <img src={student.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm">
                      {student.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-fg-primary truncate text-sm">{student.name}</p>
                  <p className="text-xs text-fg-tertiary truncate">Student</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CoinPill amount={student.coins} size="sm" variant="gold" />
                <RankChip rank={student.rank} previousRank={student.previousRank} size="sm" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-2">
            <ul className="flex flex-col gap-y-1">
              {mainNavItems.map((item, index) => {
                if ('divider' in item) {
                  return (
                    <li key={`divider-${index}`} className="my-2">
                      <div className="h-px bg-border-secondary" />
                    </li>
                  );
                }

                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                        transition-all duration-150 ease-out
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary
                        ${active
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary'
                        }
                      `}
                    >
                      <span className={`shrink-0 transition-colors ${active ? 'text-white' : 'text-fg-tertiary group-hover:text-fg-secondary'}`}>
                        <Icon size={20} weight={active ? 'fill' : 'regular'} />
                      </span>
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Section */}
          <div className="px-2 space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary
                transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary
              "
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              <span className="flex-1 text-left">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-3 border-b border-border-secondary bg-bg-secondary/95 backdrop-blur-sm px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <span className="font-semibold text-fg-primary">Univibe</span>
        </Link>

        <div className="flex-1" />

        {student && <CoinPill amount={student.coins} size="sm" />}

        <Link
          href="/notifications"
          className="
            relative p-2 rounded-lg text-fg-secondary
            hover:bg-bg-tertiary hover:text-fg-primary
            transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
          "
        >
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-error-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </Link>

        <button
          onClick={toggleTheme}
          className="
            p-2 rounded-lg text-fg-secondary
            hover:bg-bg-tertiary hover:text-fg-primary
            transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
          "
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Desktop Header with Breadcrumbs and Notifications */}
      <header className="hidden lg:flex lg:fixed lg:top-0 lg:left-[280px] lg:right-0 lg:z-40 h-14 items-center justify-between gap-x-4 border-b border-border-secondary bg-bg-secondary/95 backdrop-blur-sm px-6">
        {/* Breadcrumbs */}
        <Breadcrumbs />

        {/* Notifications */}
        <Link
          href="/notifications"
          className="
            relative p-2 rounded-lg text-fg-secondary
            hover:bg-bg-tertiary hover:text-fg-primary
            transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
          "
        >
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-error-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </Link>
      </header>

      {/* Main Content */}
      <main className="lg:pl-[280px] lg:pt-14 pb-20 lg:pb-0">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Dock Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border-secondary bg-bg-secondary/95 backdrop-blur-sm safe-area-pb">
        <div className="flex justify-around items-center h-16 px-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl
                  transition-all duration-150 min-w-[56px]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
                  ${active
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-fg-tertiary hover:text-fg-secondary'
                  }
                `}
              >
                <span className={`transition-transform ${active ? 'scale-110' : ''}`}>
                  <Icon size={22} weight={active ? 'fill' : 'regular'} />
                </span>
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && (
                  <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-brand-600 dark:bg-brand-400" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default StudentShell;
