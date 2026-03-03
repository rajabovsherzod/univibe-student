'use client';

import { CalendarCheckIcon } from '@phosphor-icons/react';
import { FeatureComingSoon } from '@/components/student/FeatureComingSoon';
import { PageHeader } from '@/components/student/PageHeader';
import { useTranslation } from '@/lib/i18n/i18n';

export default function MyEventsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pb-10">

      {/* Header */}
      <PageHeader
        title={t('myEvents.title') || 'Mening Tadbirlarim'}
        subtitle={t('myEvents.subtitle') || "Ro'yxatdan o'tgan va qatnashgan tadbirlaringizni kuzating"}
        iconName="calendar-check"
      />

      <FeatureComingSoon
        iconName="calendar-check"
        translationKey="myEvents"
      />

    </div>
  );
}
