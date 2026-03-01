'use client';

import { useState, useEffect } from 'react';
import { TelegramLogo, X } from '@phosphor-icons/react';
import { useTelegramAccount, useTelegramConnectLink } from '@/hooks/api/use-telegram';
import { useTranslation } from '@/lib/i18n/i18n';

/**
 * Professional Telegram connect banner.
 * Shows above page content when Telegram is not linked AND banner is not dismissed.
 *
 * State management:
 * - `sessionStorage` key 'tg_dismissed' — per browser session
 * - On X click → set sessionStorage → hide banner
 * - On tab close / logout → sessionStorage clears automatically
 * - On next login → banner shows again if Telegram still not linked
 */
const SESSION_KEY = 'tg_dismissed';

export function TelegramBanner() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: telegramAccount, isLoading } = useTelegramAccount();
  const telegramNotLinked = telegramAccount === null;
  const { data: connectLink } = useTelegramConnectLink(telegramNotLinked);

  // Read sessionStorage after mount (can't read on server)
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setDismissed(sessionStorage.getItem(SESSION_KEY) === 'true');
    }
  }, []);

  // Don't show if: not mounted, dismissed, loading, already linked, or no connect link
  if (!mounted || dismissed || isLoading || !telegramNotLinked || !connectLink?.connect_link) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(SESSION_KEY, 'true');
  };

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 mb-4">
      <div className="relative flex items-center gap-3 sm:gap-4 rounded-xl border border-[#0088cc]/20 bg-[#0088cc]/5 dark:bg-[#0088cc]/10 px-4 py-3 sm:py-3.5">
        {/* Telegram icon */}
        <div className="shrink-0 flex items-center justify-center size-9 sm:size-10 rounded-lg bg-[#0088cc] text-white shadow-sm">
          <TelegramLogo size={20} weight="fill" />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fg-primary leading-tight">
            {t('telegram.bannerTitle')}
          </p>
          <p className="text-xs text-fg-tertiary mt-0.5 hidden sm:block">
            {t('telegram.bannerDesc')}
          </p>
        </div>

        {/* Connect button */}
        <a
          href={connectLink.connect_link}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#0088cc] hover:bg-[#006daa] text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0088cc] focus-visible:ring-offset-2"
        >
          <TelegramLogo size={14} weight="fill" className="hidden sm:block" />
          {t('telegram.connectButton')}
        </a>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-1.5 rounded-lg text-fg-tertiary hover:text-fg-primary hover:bg-bg-tertiary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Dismiss"
        >
          <X size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}
