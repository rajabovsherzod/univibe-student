'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CaretRight, House } from '@phosphor-icons/react';
import { useTranslation } from '@/lib/i18n/i18n';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Map paths to human-readable labels
  const pathLabels: Record<string, string> = {
    '': t('nav.home'),
    'events': t('nav.events'),
    'leaderboard': t('nav.leaderboard'),
    'shop': t('nav.shop'),
    'profile': t('nav.profile'),
    'balance': t('nav.balance'),
    'wallet': t('nav.balance'),
    'my-events': t('nav.myEvents'),
    'notifications': t('nav.notifications'),
    'settings': t('nav.settings') || 'Settings',
  };

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);

    const breadcrumbs: BreadcrumbItem[] = [
      { label: t('nav.home'), href: '/' }
    ];

    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Check if it's a known path or a dynamic ID
      const label = pathLabels[segment] ||
        (segment.match(/^[0-9a-f-]+$/) ? 'Details' :
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '));

      breadcrumbs.push({
        label,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Allow breadcrumb to render even on home page as requested
  if (pathname === '/') {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center mt-1">
        <ol className="flex items-center gap-1.5 text-sm">
          <li className="flex items-center gap-1.5">
            <span className="font-medium text-fg-primary truncate max-w-[150px]">
              {t('nav.home')}
            </span>
          </li>
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center">
      <ol className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li key={crumb.href} className="flex items-center gap-1.5">
              {index > 0 && (
                <CaretRight
                  size={12}
                  weight="bold"
                  className="text-fg-quaternary flex-shrink-0"
                />
              )}

              {isLast ? (
                <span className="font-medium text-fg-primary truncate max-w-[150px]">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="
                    flex items-center gap-1.5 text-fg-tertiary 
                    hover:text-brand-600 dark:hover:text-brand-400
                    transition-colors
                  "
                >
                  {isFirst && (
                    <House size={14} weight="fill" className="flex-shrink-0" />
                  )}
                  <span className="truncate max-w-[100px]">{crumb.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
