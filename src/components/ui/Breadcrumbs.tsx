'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CaretRight, House } from '@phosphor-icons/react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

// Map paths to human-readable labels
const pathLabels: Record<string, string> = {
  '': 'Home',
  'events': 'Events',
  'leaderboard': 'Leaderboard',
  'shop': 'Shop',
  'profile': 'Profile',
  'wallet': 'Wallet',
  'my-events': 'My Events',
  'notifications': 'Notifications',
  'settings': 'Settings',
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);

    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
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

  // Don't show breadcrumbs on home page
  if (pathname === '/') {
    return null;
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
