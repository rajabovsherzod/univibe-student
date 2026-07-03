'use client';

import Link from 'next/link';
import { UsersThreeIcon, HeartIcon, ShieldStarIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useManagedClubs, type ManagedClub } from '@/hooks/api/use-clubs';
import { FLAvatar, RoleBadge } from '@/components/student/ClubBits';
import { useTranslation } from '@/lib/i18n/i18n';

function ManagedClubRow({ club }: { club: ManagedClub }) {
  const { t } = useTranslation();

  return (
    <Link
      href={`/my-clubs/${club.public_id}`}
      className="group flex items-center gap-3.5 rounded-2xl bg-bg-secondary p-3.5 shadow-sm transition-all hover:shadow-md"
    >
      <FLAvatar src={club.logo} name={club.name} size={52} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-fg-primary">{club.name}</h3>
          <RoleBadge code={club.my_role_code || ''} roleName={club.my_role_name} t={t} />
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-fg-tertiary">
          <span className="flex items-center gap-1"><UsersThreeIcon size={12} /> {club.members_count}</span>
          <span className="flex items-center gap-1"><HeartIcon size={12} /> {club.followers_count}</span>
        </div>
      </div>

      <CaretRightIcon size={18} className="shrink-0 text-fg-quaternary transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function MyClubsPage() {
  const { t } = useTranslation();
  const { data: clubs = [], isPending } = useManagedClubs();

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-bg-secondary shadow-sm p-5 sm:p-6">
        <div className="absolute -right-4 -top-4 opacity-[0.06] pointer-events-none select-none">
          <ShieldStarIcon size={140} weight="fill" className="text-brand-400 rotate-12" />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-fg-primary">{t('myClubs.title') || 'Mening klublarim'}</h1>
          <p className="mt-0.5 text-xs sm:text-sm text-fg-tertiary">
            {t('myClubs.subtitle') || "Siz rahbarlik qiladigan klublarni boshqaring"}
          </p>
        </div>
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[86px] rounded-2xl skeleton-shimmer" />)}
        </div>
      ) : clubs.length > 0 ? (
        <div className="space-y-3">
          {clubs.map((c) => <ManagedClubRow key={c.public_id} club={c} />)}
        </div>
      ) : (
        <div className="rounded-2xl bg-bg-secondary shadow-sm py-16 text-center">
          <ShieldStarIcon size={48} weight="light" className="mx-auto mb-4 text-fg-quaternary" />
          <h3 className="mb-1 text-base font-semibold text-fg-primary">{t('myClubs.emptyTitle') || 'Siz hali klub rahbari emassiz'}</h3>
          <p className="mx-auto max-w-md text-sm text-fg-tertiary">
            {t('myClubs.emptyDescription') || "Klubga rahbar sifatida biriktirilganingizda shu yerda ko'rinadi."}
          </p>
        </div>
      )}
    </div>
  );
}
