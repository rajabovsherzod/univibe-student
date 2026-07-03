'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { performLogout } from '@/lib/logout';
import { applyTheme } from '@/lib/theme';
import {
  HouseIcon,
  CalendarBlankIcon,
  TrophyIcon,
  StorefrontIcon,
  UserIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  WalletIcon,
  CalendarCheckIcon,
  SignOutIcon,
  ClockIcon,
  XCircleIcon,
  DotsThreeOutlineIcon,
  UsersThreeIcon,
  ShieldStarIcon,
} from '@phosphor-icons/react/dist/ssr';
import { useStudentMe } from '@/hooks/api/use-profile';
import { useManagedClubs } from '@/hooks/api/use-clubs';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTranslation } from '@/lib/i18n/i18n';
import { useProfileStore } from '@/store/profile-store';
import { useInitialUser } from '@/providers/app-provider';
import { TelegramBanner } from '@/components/student/TelegramBanner';
import { toHttps } from '@/utils/cx';
import { useActivityTracker } from '@/hooks/use-activity-tracker';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ size?: number; weight?: 'regular' | 'fill' | 'bold' }>;
  /** only shown when the student leads at least one club */
  requiresManaged?: boolean;
}

interface NavDivider { divider: true }
type NavConfigItem = NavItem | NavDivider;

const mainNavItems: NavConfigItem[] = [
  { href: '/', labelKey: 'nav.home', icon: HouseIcon },
  { href: '/events', labelKey: 'nav.events', icon: CalendarBlankIcon },
  { href: '/clubs', labelKey: 'nav.clubs', icon: UsersThreeIcon },
  { href: '/leaderboard', labelKey: 'nav.leaderboard', icon: TrophyIcon },
  { href: '/shop', labelKey: 'nav.shop', icon: StorefrontIcon },
  { divider: true },
  { href: '/my-events', labelKey: 'nav.myEvents', icon: CalendarCheckIcon },
  { href: '/my-clubs', labelKey: 'nav.myClubs', icon: ShieldStarIcon, requiresManaged: true },
  { href: '/balance', labelKey: 'nav.balance', icon: WalletIcon },
  { divider: true },
  { href: '/profile', labelKey: 'nav.profile', icon: UserIcon },
];

// Bottom bardagi 4 ta asosiy tab
const primaryMobileNav: NavItem[] = [
  { href: '/', labelKey: 'nav.home', icon: HouseIcon },
  { href: '/events', labelKey: 'nav.events', icon: CalendarBlankIcon },
  { href: '/leaderboard', labelKey: 'nav.leaderboard', icon: TrophyIcon },
  { href: '/shop', labelKey: 'nav.shop', icon: StorefrontIcon },
];

// "More" sheet ichidagi qo'shimcha itemlar
const moreMobileNav: NavItem[] = [
  { href: '/clubs', labelKey: 'nav.clubs', icon: UsersThreeIcon },
  { href: '/my-clubs', labelKey: 'nav.myClubs', icon: ShieldStarIcon, requiresManaged: true },
  { href: '/my-events', labelKey: 'nav.myEvents', icon: CalendarCheckIcon },
  { href: '/balance', labelKey: 'nav.balance', icon: WalletIcon },
  { href: '/profile', labelKey: 'nav.profile', icon: UserIcon },
];

function StatusBadge({ status, t }: { status: 'waited' | 'approved' | 'rejected'; t: (key: string) => string }) {
  if (status === 'approved') return null;
  if (status === 'waited') return (
    <div className="mx-2 flex items-center gap-1.5 rounded-lg bg-brand-50 dark:bg-brand-600/10 border border-brand-200 dark:border-brand-600/30 px-3 py-2 text-xs font-medium text-brand-700 dark:text-brand-500">
      <ClockIcon size={12} weight="fill" className="shrink-0" />
      <span>{t('profile.statusWaited')}</span>
    </div>
  );
  return (
    <div className="mx-2 flex items-center gap-1.5 rounded-lg bg-error-50 dark:bg-error-600/10 border border-error-200 dark:border-error-600/30 px-3 py-2 text-xs font-medium text-error-700 dark:text-error-500">
      <XCircleIcon size={12} weight="fill" className="shrink-0" />
      <span>{t('profile.statusRejected')}</span>
    </div>
  );
}

export function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data: session, status, update: updateSession } = useSession();
  const { data: profile } = useStudentMe();
  const { data: managedClubs = [] } = useManagedClubs();
  const hasManagedClubs = managedClubs.length > 0;

  // Hide leadership-only nav items for students who don't lead any club.
  const visibleMainNav = mainNavItems.filter(
    (it) => !('requiresManaged' in it && it.requiresManaged) || hasManagedClubs,
  );
  const visibleMoreNav = moreMobileNav.filter((it) => !it.requiresManaged || hasManagedClubs);

  // ── Force logout when the session is gone or the refresh token is dead ──
  // Without this the app would sit on a stuck profile skeleton (no token → no
  // profile) instead of signing the student out. Runs client-side so it fires
  // mid-session too, not only on a full navigation (which middleware handles).
  // Redirects to the env-configured public app URL (never a bare localhost).
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || session?.error === 'RefreshAccessTokenError') {
      performLogout();
    }
  }, [status, session?.error]);

  // Activity tracking: inactivity logout + proactive token refresh
  useActivityTracker();
  const [isDark, setIsDark] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Sahifa o'zgarganda "More" sheetni yopish
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  // ── Zustand store: cache profile data for instant sidebar rendering
  const { profile: cachedProfile, setProfile: setCachedProfile } = useProfileStore();
  const initialUser = useInitialUser();

  // Sync API data → zustand store (when fresh data arrives)
  useEffect(() => {
    if (profile) {
      setCachedProfile({
        user_public_id: profile.user_public_id,
        name: profile.name,
        surname: profile.surname,
        full_name: profile.full_name,
        user_name: profile.user_name,
        user_surname: profile.user_surname,
        email: profile.email,
        profile_photo: toHttps(profile.profile_photo_url),
        university_name: profile.university_name,
        university_public_id: profile.university_public_id,
        faculty_name: profile.faculty_name,
        degree_level_name: profile.degree_level_name,
        year_level_name: profile.year_level_name,
        status: profile.status,
        contact_phone_number: profile.contact_phone_number,
        date_of_birth: profile.date_of_birth,
      });
      // Write essential user data to cookie → server reads for zero-flash SSR
      // Only name + surname (no middle name, no username)
      const dispName = `${profile.name || ''} ${profile.surname || ''}`.trim();
      const photoUrl = toHttps(profile.profile_photo_url) || '';
      const userData = JSON.stringify({ name: dispName, email: profile.email, photo: photoUrl });
      document.cookie = `user_data=${encodeURIComponent(userData)};path=/;max-age=31536000;SameSite=Lax`;
    }
  }, [profile, setCachedProfile]);

  // ── Sync session status if backend status differs from JWT token
  useEffect(() => {
    if (profile && session?.user?.studentStatus && session.user.studentStatus !== profile.status) {
      updateSession({ studentStatus: profile.status }).catch(() => { });
    }
  }, [profile, session, updateSession]);

  // useLayoutEffect for theme → reads dark-mode class BEFORE paint (no flash)
  useLayoutEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark-mode'));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    // Shared helper: suppresses the transition flash + persists to storage+cookie.
    applyTheme(next);
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // Use cached profile for instant display, fall back to cookie → session
  const profileName = (cachedProfile?.name || cachedProfile?.surname)
    ? `${cachedProfile?.name || ''} ${cachedProfile?.surname || ''}`.trim()
    : undefined;
  const rawDisplayName = profileName || initialUser?.name || session?.user?.name || '\u00A0';
  const displayName = rawDisplayName.replace(/\bUser\b/ig, '').trim() || '\u00A0';
  const displayEmail = cachedProfile?.email || initialUser?.email || session?.user?.email || '\u00A0';
  const displayPhoto = cachedProfile?.profile_photo || initialUser?.photo || session?.user?.image || undefined;
  const displayStatus = (cachedProfile?.status || profile?.status || session?.user?.studentStatus) as 'waited' | 'approved' | 'rejected' | undefined;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-[280px] lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border-secondary bg-bg-secondary px-4 py-6">

          {/* Logo */}
          <div className="flex h-10 shrink-0 items-center px-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/icon.svg" alt="Univibe" width={36} height={36} priority className="shrink-0" />
              <span className="text-lg font-bold text-fg-primary">
                Uni<span className="text-brand-600">vibe</span>
              </span>
            </Link>
          </div>

          {/* User Card */}
          <div className="mx-2 rounded-xl bg-bg-primary border border-border-secondary p-3.5 min-h-[68px]">
            {(!displayName || displayName === '\u00A0') ? (
              <div className="flex items-center gap-3 animate-pulse-fast">
                <div className="w-10 h-10 rounded-full bg-bg-secondary border border-border-secondary skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-2.5 w-3/4 rounded bg-bg-secondary border border-border-secondary skeleton-shimmer" />
                  <div className="h-2 w-full rounded bg-bg-secondary border border-border-secondary skeleton-shimmer" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full shrink-0 overflow-hidden ring-2 ring-border-secondary">
                    {displayPhoto ? (
                      <Image 
                        src={displayPhoto} 
                        alt={displayName} 
                        fill 
                        className="object-cover" 
                        unoptimized 
                        priority
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-600 text-white font-bold text-sm">
                        {initial}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-fg-primary truncate text-sm">{displayName}</p>
                    <p className="text-xs text-fg-tertiary truncate">{displayEmail}</p>
                  </div>
                </div>
                {displayStatus && displayStatus !== 'approved' && (
                  <div className="mt-2.5">
                    <StatusBadge status={displayStatus} t={t} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-2">
            <ul className="flex flex-col gap-y-0.5">
              {visibleMainNav.map((item, index) => {
                if ('divider' in item) {
                  return <li key={`div-${index}`} className="my-2 h-px bg-border-secondary" />;
                }
                const Icon = item.icon;
                const active = isActive(item.href);

                // Lockout condition
                const isLocked = (!displayStatus || displayStatus !== 'approved') && item.href !== '/personal-info';

                if (isLocked) {
                  return (
                    <li key={item.href}>
                      <button
                        onClick={() => toast.warning(t('personalInfo.fillFirstMessage') || "Iltimos, avval shaxsiy ma'lumotlaringizni to'ldiring!")}
                        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 opacity-50 cursor-not-allowed text-fg-secondary"
                      >
                        <span className="shrink-0 text-fg-tertiary">
                          <Icon size={20} weight="regular" />
                        </span>
                        <span className="flex-1 text-left">{t(item.labelKey)}</span>
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${active
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary'
                        }`}
                    >
                      <span className={`shrink-0 transition-colors ${active ? 'text-white' : 'text-fg-tertiary group-hover:text-fg-secondary'}`}>
                        <Icon size={20} weight={active ? 'fill' : 'regular'} />
                      </span>
                      <span className="flex-1">{t(item.labelKey)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom */}
          <div className="px-2 space-y-0.5">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
              <span className="flex-1 text-left">{isDark ? t('common.lightMode') : t('common.darkMode')}</span>
            </button>
            <button
              onClick={() => {
                // Fully clear auth storage on logout to prevent state leaking
                document.cookie = 'user_data=;path=/;max-age=0;SameSite=Lax';
                localStorage.removeItem('univibe-profile');
                localStorage.removeItem('user-storage');
                localStorage.removeItem('user-profile-storage');
                sessionStorage.clear();
                performLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error-600 dark:text-error-500 hover:bg-error-50 dark:hover:bg-error-600/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
            >
              <SignOutIcon size={20} />
              <span className="flex-1 text-left">{t('profile.logoutButton')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-3 border-b border-border-secondary bg-bg-secondary/95 backdrop-blur-sm px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.svg" alt="Univibe" width={32} height={32} priority />
          <span className="font-bold text-fg-primary">Univibe</span>
        </Link>
        <div className="flex-1" />
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <BellIcon size={20} />
        </Link>
        <LanguageSwitcher />
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        </button>
      </header>

      {/* Desktop Top Bar */}
      <header className="hidden lg:flex lg:fixed lg:top-0 lg:left-[280px] lg:right-0 lg:z-40 h-14 items-center justify-between gap-x-4 border-b border-border-secondary bg-bg-secondary/95 backdrop-blur-sm px-6">
        <Breadcrumbs />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/notifications"
            className="relative p-2 rounded-lg text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <BellIcon size={20} />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-[280px] lg:pt-14 pb-20 lg:pb-0">
        <div className="pt-4">
          <TelegramBanner />
        </div>
        <div className="px-4 py-2 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav — 4 tab + More */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border-secondary bg-bg-secondary/95 backdrop-blur-sm">
        <div className="flex items-center h-16">
          {/* 4 ta asosiy tab */}
          {primaryMobileNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isLocked = (!displayStatus || displayStatus !== 'approved');

            if (isLocked) {
              return (
                <button
                  key={item.href}
                  onClick={() => toast.warning(t('personalInfo.fillFirstMessage') || "Iltimos, avval shaxsiy ma'lumotlaringizni to'ldiring!")}
                  className="flex flex-col items-center justify-center flex-1 h-full gap-1 opacity-40 cursor-not-allowed text-fg-quaternary"
                >
                  <Icon size={22} weight="regular" />
                  <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                  active ? 'text-brand-600' : 'text-fg-quaternary hover:text-fg-secondary'
                }`}
              >
                <Icon size={22} weight={active ? 'fill' : 'regular'} />
                <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}

          {/* More tugmasi */}
          {(() => {
            const moreIsActive = visibleMoreNav.some(item => isActive(item.href));
            const highlighted = moreOpen || moreIsActive;
            return (
              <button
                onClick={() => setMoreOpen(prev => !prev)}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                  highlighted ? 'text-brand-600' : 'text-fg-quaternary hover:text-fg-secondary'
                }`}
              >
                <DotsThreeOutlineIcon size={22} weight={highlighted ? 'fill' : 'regular'} />
                <span className="text-[10px] font-medium">{t('nav.more') || 'Ko\'proq'}</span>
              </button>
            );
          })()}
        </div>
      </nav>

      {/* More — bottom sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMoreOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 380, mass: 0.9 }}
              className="lg:hidden fixed bottom-0 inset-x-0 z-50 rounded-t-3xl bg-bg-secondary border-t border-border-secondary shadow-2xl"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-[5px] rounded-full bg-border-secondary" />
              </div>

              {/* Sheet items — 3 column grid */}
              <div className="grid grid-cols-3 gap-3 px-5 pt-2 pb-8">
                {visibleMoreNav.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const isLocked = (!displayStatus || displayStatus !== 'approved');

                  if (isLocked) {
                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          setMoreOpen(false);
                          toast.warning(t('personalInfo.fillFirstMessage') || "Iltimos, avval shaxsiy ma'lumotlaringizni to'ldiring!");
                        }}
                        className="flex flex-col items-center gap-2.5 py-4 px-2 rounded-2xl bg-bg-tertiary opacity-40 cursor-not-allowed"
                      >
                        <Icon size={28} weight="regular" />
                        <span className="text-xs font-semibold text-fg-tertiary text-center">{t(item.labelKey)}</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex flex-col items-center gap-2.5 py-4 px-2 rounded-2xl transition-all active:scale-95 ${
                        active
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-bg-tertiary text-fg-secondary hover:bg-bg-primary'
                      }`}
                    >
                      <Icon size={28} weight={active ? 'fill' : 'regular'} />
                      <span className="text-xs font-semibold text-center leading-tight">{t(item.labelKey)}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StudentShell;
