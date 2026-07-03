'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  ArrowLeftIcon, UsersThreeIcon, HeartIcon, HeartStraightIcon,
  UsersFourIcon, CheckCircleIcon, SealCheckIcon,
} from '@phosphor-icons/react';
import { useClub, useFollowClub, useUnfollowClub, clubCategoryName } from '@/hooks/api/use-clubs';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n/i18n';
import { toHttps } from '@/utils/cx';

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { t } = useTranslation();

  const { data: club, isPending } = useClub(id);
  const { mutate: follow, isPending: isFollowing } = useFollowClub();
  const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowClub();

  const busy = isFollowing || isUnfollowing;

  const handleToggle = () => {
    if (!club) return;
    if (club.is_following) {
      unfollow(id, {
        onSuccess: () => toast.success(t('clubs.unfollowed')),
        onError: (e: any) => toast.error(e?.response?.data?.detail || t('clubs.unfollowLocked')),
      });
    } else {
      follow(id, {
        onSuccess: () => toast.success(t('clubs.followed')),
        onError: (e: any) => toast.error(e?.response?.data?.detail || t('common.error')),
      });
    }
  };

  if (isPending) {
    return (
      <div className="space-y-4 pb-10">
        <div className="h-9 w-24 rounded-lg skeleton-shimmer" />
        <div className="aspect-[3/1] rounded-2xl skeleton-shimmer" />
        <div className="space-y-3 rounded-2xl border border-border-secondary bg-bg-secondary p-5">
          <div className="h-6 w-1/2 rounded skeleton-shimmer" />
          <div className="h-4 w-2/3 rounded skeleton-shimmer" />
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm py-16 text-center">
        <UsersFourIcon size={48} weight="light" className="mx-auto mb-4 text-fg-quaternary" />
        <p className="text-sm text-fg-tertiary">{t('clubs.emptyTitle') || 'Klub topilmadi'}</p>
        <button onClick={() => router.push('/clubs')} className="mt-4 text-sm font-semibold text-brand-600 hover:underline">
          {t('clubs.backToClubs') || 'Klublarga qaytish'}
        </button>
      </div>
    );
  }

  const banner = toHttps(club.banner);
  const logo = toHttps(club.logo);
  const category = clubCategoryName(club.category);

  return (
    <div className="space-y-4 pb-10">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-tertiary transition-colors hover:text-fg-primary"
      >
        <ArrowLeftIcon size={16} /> {t('clubs.backToClubs') || 'Orqaga'}
      </button>

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-border-secondary bg-bg-secondary shadow-sm">
        <div className="relative aspect-[3/1] bg-bg-tertiary">
          {banner ? (
            <Image src={banner} alt={club.name} fill className="object-cover" unoptimized priority />
          ) : (
            <div className="size-full bg-gradient-to-br from-brand-500/25 to-brand-700/10" />
          )}
        </div>

        <div className="px-5 pb-5">
          {/* Logo + name + follow */}
          <div className="flex items-end justify-between gap-3">
            <div className="flex items-end gap-3">
              <div className="-mt-10 size-20 shrink-0 overflow-hidden rounded-2xl bg-bg-secondary ring-4 ring-bg-secondary shadow-sm">
                {logo ? (
                  <Image src={logo} alt={club.name} width={80} height={80} className="size-full object-cover" unoptimized />
                ) : (
                  <div className="flex size-full items-center justify-center bg-brand-600 text-2xl font-bold text-white">
                    {(club.name || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleToggle}
              disabled={busy}
              className={
                club.is_following
                  ? 'mt-3 inline-flex items-center gap-2 rounded-xl bg-bg-tertiary px-5 py-2.5 text-sm font-semibold text-fg-primary ring-1 ring-border-primary transition-colors hover:bg-bg-primary disabled:opacity-60'
                  : 'mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-60'
              }
            >
              {busy ? (
                <Spinner className="size-4" />
              ) : (
                <>
                  {club.is_following ? <CheckCircleIcon size={16} weight="fill" /> : <HeartStraightIcon size={16} weight="fill" />}
                  {club.is_following ? t('clubs.following') : t('clubs.follow')}
                </>
              )}
            </button>
          </div>

          {/* Name + meta */}
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-fg-primary">{club.name}</h1>
              {club.is_member && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20">
                  <SealCheckIcon size={12} weight="fill" /> {t('clubs.member')}
                </span>
              )}
            </div>
            {category && <p className="mt-0.5 text-sm text-brand-600">{category}</p>}
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-3">
            <div className="flex flex-1 items-center gap-2.5 rounded-xl bg-bg-tertiary px-4 py-3">
              <UsersThreeIcon size={18} className="text-brand-600" />
              <div>
                <p className="text-sm font-bold text-fg-primary">{club.members_count}</p>
                <p className="text-[11px] text-fg-tertiary">{t('clubs.members')}</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2.5 rounded-xl bg-bg-tertiary px-4 py-3">
              <HeartIcon size={18} className="text-brand-600" />
              <div>
                <p className="text-sm font-bold text-fg-primary">{club.followers_count}</p>
                <p className="text-[11px] text-fg-tertiary">{t('clubs.followers')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      {(club.description || club.short_description) && (
        <div className="rounded-2xl border border-border-secondary bg-bg-secondary p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-fg-primary">{t('clubs.about')}</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-fg-secondary">
            {club.description || club.short_description}
          </p>
        </div>
      )}
    </div>
  );
}
