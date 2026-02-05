'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  Trophy,
  ShoppingBag,
  User,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  Wallet,
} from 'lucide-react';
import { CoinPill } from './CoinPill';
import { RankChip } from './RankChip';

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

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/profile', label: 'Profile', icon: User },
];

export function StudentShell({
  children,
  student,
  unreadNotifications = 0,
}: StudentShellProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check initial theme
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
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border-secondary bg-bg-secondary px-6 py-6">
          {/* Logo */}
          <div className="flex h-12 shrink-0 items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-xl font-bold text-fg-primary">
                Univibe<span className="text-brand-600">Student</span>
              </span>
            </Link>
          </div>

          {/* User Info */}
          {student && (
            <div className="p-4 rounded-xl bg-bg-tertiary">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900 flex-shrink-0">
                  {student.avatar ? (
                    <img src={student.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
                      {student.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-fg-primary truncate text-sm">{student.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CoinPill amount={student.coins} size="sm" />
                <RankChip rank={student.rank} previousRank={student.previousRank} size="sm" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        group flex gap-x-3 rounded-lg p-3 text-sm font-medium
                        transition-colors duration-150
                        focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
                        ${active
                          ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                          : 'text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary'
                        }
                      `}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 ${active ? 'text-brand-600 dark:text-brand-400' : 'text-fg-tertiary group-hover:text-fg-secondary'
                          }`}
                      />
                      {item.label}
                      {active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />
                      )}
                    </Link>
                  </li>
                );
              })}

              {/* Extra Links */}
              <li className="mt-2 pt-2 border-t border-border-secondary">
                <Link
                  href="/wallet"
                  className={`
                    group flex gap-x-3 rounded-lg p-3 text-sm font-medium
                    transition-colors duration-150
                    focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
                    ${pathname === '/wallet'
                      ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                      : 'text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary'
                    }
                  `}
                >
                  <Wallet className="h-5 w-5 shrink-0 text-fg-tertiary group-hover:text-fg-secondary" />
                  Wallet
                </Link>
              </li>
              <li>
                <Link
                  href="/my-events"
                  className={`
                    group flex gap-x-3 rounded-lg p-3 text-sm font-medium
                    transition-colors duration-150
                    focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
                    ${pathname === '/my-events'
                      ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                      : 'text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary'
                    }
                  `}
                >
                  <Calendar className="h-5 w-5 shrink-0 text-fg-tertiary group-hover:text-fg-secondary" />
                  My Events
                </Link>
              </li>
            </ul>
          </nav>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="
              flex items-center gap-3 p-3 rounded-lg text-sm font-medium
              text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary
              transition-colors duration-150
              focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
            "
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border-secondary bg-bg-secondary px-4 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold">U</span>
          </div>
          <span className="font-bold text-fg-primary">Univibe</span>
        </Link>

        <div className="flex-1" />

        {/* Coins & Notifications */}
        {student && <CoinPill amount={student.coins} size="sm" />}

        <Link
          href="/notifications"
          className="
            relative p-2 rounded-lg text-fg-secondary
            hover:bg-bg-tertiary hover:text-fg-primary
            transition-colors
            focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
          "
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error-500 text-white text-xs flex items-center justify-center font-medium">
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
            focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
          "
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Desktop Header with Notifications */}
      <header className="hidden lg:flex lg:fixed lg:top-0 lg:left-64 lg:right-0 lg:z-40 h-16 items-center gap-x-4 border-b border-border-secondary bg-bg-secondary px-6">
        <div className="flex-1" />

        {/* Notification Bell */}
        <Link
          href="/notifications"
          className="
            relative p-2 rounded-lg text-fg-secondary
            hover:bg-bg-tertiary hover:text-fg-primary
            transition-colors
            focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
          "
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error-500 text-white text-xs flex items-center justify-center font-medium">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </Link>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64 lg:pt-16 pb-20 lg:pb-0">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Dock Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border-secondary bg-bg-secondary/95 backdrop-blur-sm">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg
                  transition-colors duration-150 min-w-14
                  focus-visible:ring-2 focus-visible:ring-brand-500
                  ${active
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-fg-tertiary hover:text-fg-secondary'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                <span className="text-xs font-medium">{item.label}</span>
                {active && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-600 dark:bg-brand-400" />
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
