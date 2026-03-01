import type { ComponentType } from 'react';

interface Props {
  icon: ComponentType<{ size?: number; weight?: 'fill' | 'regular' | 'bold'; className?: string }>;
  title: string;
  description?: string;
  badge?: string;
}

/**
 * Professional "feature coming soon" placeholder.
 * Used on pages that don't have real API data yet.
 * Matches the project design system — brand colors, no dead grays.
 */
export function FeatureComingSoon({ icon: Icon, title, description, badge = 'Tez orada' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] py-16 px-4 text-center">

      {/* Animated "coming soon" badge */}
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 px-3.5 py-1.5 mb-8">
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-brand-500 animate-ping opacity-75" />
          <span className="relative inline-flex rounded-full size-2 bg-brand-500" />
        </span>
        <span className="text-xs font-semibold text-brand-700 dark:text-brand-400">{badge}</span>
      </div>

      {/* Icon with concentric rings */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute size-40 rounded-full border border-brand-200/60 dark:border-brand-800/60" />
        {/* Middle ring */}
        <div className="absolute size-28 rounded-full border border-brand-300/50 dark:border-brand-700/50" />
        {/* Icon circle */}
        <div className="relative size-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl shadow-brand-500/25">
          <Icon size={40} weight="fill" className="text-white" />
        </div>
      </div>

      {/* Text */}
      <h2 className="text-xl sm:text-2xl font-bold text-fg-primary mb-2.5">{title}</h2>
      {description && (
        <p className="text-sm text-fg-tertiary max-w-md leading-relaxed">{description}</p>
      )}
    </div>
  );
}
