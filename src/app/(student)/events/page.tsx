'use client';

import { CalendarBlankIcon } from '@phosphor-icons/react';
import { FeatureComingSoon } from '@/components/student/FeatureComingSoon';
import { PageHeader } from '@/components/student/PageHeader';
import { useTranslation } from '@/lib/i18n/i18n';

export default function EventsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pb-10">

      {/* Header */}
      <PageHeader
        title={t('events.title') || 'Tadbirlar'}
        subtitle={t('events.subtitle') || "Universitetdagi tadbirlarni ko'ring va ro'yxatdan o'ting"}
        iconName="calendar"
      />

      <FeatureComingSoon
        iconName="calendar"
        translationKey="events"
      />

    </div>
  );
}
