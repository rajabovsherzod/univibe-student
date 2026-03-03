'use client';

import { PageHeader } from '@/components/student/PageHeader';
import { FeatureComingSoon } from '@/components/student/FeatureComingSoon';
import { useTranslation } from '@/lib/i18n/i18n';
import { Bell as BellIcon } from '@phosphor-icons/react';

export default function NotificationsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <PageHeader
        title={t('notifications.title') || 'Bildirishnomalar'}
        subtitle={t('notifications.featureTitle') || 'Bildirishnomalar tez kunda'}
        iconName="bell"
      />

      {/* Coming Soon State */}
      <FeatureComingSoon
        iconName="bell"
        translationKey="notifications"
      />
    </div>
  );
}
