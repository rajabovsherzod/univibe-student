'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeftIcon, UsersThreeIcon, HeartIcon, ShieldStarIcon, PlusIcon } from '@phosphor-icons/react';
import {
  useManagedClub, useClubMembers, useClubFollowers, useClubRoles,
  useRemoveClubMember, useAddClubMember, hasClubPerm,
  type ClubMember, type ClubFollowerItem,
} from '@/hooks/api/use-clubs';
import { Button } from '@/components/base/buttons/button';
import { FLAvatar, RoleBadge } from '@/components/student/ClubBits';
import { useTranslation } from '@/lib/i18n/i18n';

type Tab = 'members' | 'followers';

export default function ClubManagePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { t } = useTranslation();

  const { data: club, isPending: clubLoading } = useManagedClub(id);
  const perms = club?.my_permissions;
  const canViewMembers = hasClubPerm(perms, 'club.members.view');
  const canRemove = hasClubPerm(perms, 'club.members.remove');
  const canAdd = hasClubPerm(perms, 'club.members.add');
  const canViewFollowers = hasClubPerm(perms, 'club.followers.view');

  const [tab, setTab] = useState<Tab>('members');
  const activeTab: Tab = !canViewMembers && canViewFollowers ? 'followers' : tab;

  const { data: members = [], isPending: membersLoading } = useClubMembers(id, canViewMembers);
  const { data: followers = [], isPending: followersLoading } = useClubFollowers(id, canViewFollowers);
  const { data: roles = [] } = useClubRoles(id, canAdd);

  const { mutate: removeMember, isPending: removing } = useRemoveClubMember(id);
  const { mutate: addMember, isPending: adding } = useAddClubMember(id);
  const [confirmRemove, setConfirmRemove] = useState<ClubMember | null>(null);
  const [confirmAdd, setConfirmAdd] = useState<ClubFollowerItem | null>(null);

  const memberRole = roles.find((r) => r.code === 'MEMBER');
  const leaders = members.filter((m) => m.role_code !== 'MEMBER');
  const regularMembers = members.filter((m) => m.role_code === 'MEMBER');

  // Following ≠ membership. The "followers" management list only shows followers
  // who are NOT yet members — the leader recruits them into the club from here.
  const memberIds = new Set(members.map((m) => m.student_public_id));
  const recruitableFollowers = followers.filter((f) => !memberIds.has(f.student_public_id));

  if (clubLoading && !club) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-24 rounded-lg skeleton-shimmer" />
        <div className="h-24 rounded-2xl skeleton-shimmer" />
        <div className="h-64 rounded-2xl skeleton-shimmer" />
      </div>
    );
  }
  if (!club) {
    return (
      <div className="rounded-2xl bg-bg-secondary shadow-sm py-16 text-center">
        <ShieldStarIcon size={48} weight="light" className="mx-auto mb-4 text-fg-quaternary" />
        <p className="text-sm text-fg-tertiary">{t('myClubs.emptyTitle') || 'Klub topilmadi'}</p>
        <Button size="sm" color="link-color" onClick={() => router.push('/my-clubs')} className="mx-auto mt-4">
          {t('myClubs.back') || 'Orqaga'}
        </Button>
      </div>
    );
  }

  const doRemove = () => {
    if (!confirmRemove) return;
    const m = confirmRemove;
    setConfirmRemove(null);
    removeMember(m.student_public_id, {
      onSuccess: () => toast.success(t('myClubs.memberRemoved') || "A'zo o'chirildi"),
      onError: (e: any) => toast.error(e?.response?.data?.detail || t('common.error')),
    });
  };

  const doAdd = () => {
    if (!confirmAdd || !memberRole) return;
    const f = confirmAdd;
    setConfirmAdd(null);
    addMember(
      { studentPublicId: f.student_public_id, roleId: memberRole.public_id },
      {
        onSuccess: () => toast.success(t('myClubs.memberAdded') || "A'zo qo'shildi"),
        onError: (e: any) => toast.error(e?.response?.data?.detail || t('common.error')),
      },
    );
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Back */}
      <Button size="sm" color="tertiary" iconLeading={ArrowLeftIcon} onClick={() => router.push('/my-clubs')} className="-ml-2">
        {t('myClubs.title') || 'Mening klublarim'}
      </Button>

      {/* Club header */}
      <div className="flex items-center gap-4 rounded-2xl bg-bg-secondary p-4 shadow-sm">
        <FLAvatar src={club.logo} name={club.name} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-fg-primary">{club.name}</h1>
          <div className="mt-1"><RoleBadge code={club.my_role_code || ''} roleName={club.my_role_name} t={t} /></div>
        </div>
        <div className="hidden shrink-0 gap-4 text-center sm:flex">
          <div><p className="text-sm font-bold text-fg-primary">{club.members_count}</p><p className="text-[11px] text-fg-tertiary">{t('clubs.members')}</p></div>
          <div><p className="text-sm font-bold text-fg-primary">{club.followers_count}</p><p className="text-[11px] text-fg-tertiary">{t('clubs.followers')}</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {canViewMembers && (
          <Button size="sm" color={activeTab === 'members' ? 'primary' : 'secondary'} iconLeading={UsersThreeIcon} onClick={() => setTab('members')}>
            {t('myClubs.members') || "A'zolar"}
          </Button>
        )}
        {canViewFollowers && (
          <Button size="sm" color={activeTab === 'followers' ? 'primary' : 'secondary'} iconLeading={HeartIcon} onClick={() => setTab('followers')}>
            {t('myClubs.followers') || 'Obunachilar'}
          </Button>
        )}
      </div>

      {/* MEMBERS — grouped: leaders first, then members */}
      {activeTab === 'members' && canViewMembers && (
        membersLoading ? (
          <div className="h-64 rounded-2xl skeleton-shimmer" />
        ) : members.length === 0 ? (
          <div className="rounded-2xl bg-bg-secondary py-12 text-center text-sm text-fg-tertiary shadow-sm">{t('myClubs.noMembers') || "A'zolar yo'q"}</div>
        ) : (
          <div className="space-y-4">
            {leaders.length > 0 && (
              <Section title={t('myClubs.leadersSection') || 'Rahbarlar'}>
                {leaders.map((m) => (
                  <Row key={m.public_id} name={m.student_name}>
                    <RoleBadge code={m.role_code} roleName={m.role_name} t={t} />
                  </Row>
                ))}
              </Section>
            )}
            {regularMembers.length > 0 && (
              <Section title={t('myClubs.members') || "A'zolar"} count={regularMembers.length}>
                {regularMembers.map((m) => (
                  <Row key={m.public_id} name={m.student_name}>
                    {canRemove && (
                      <Button size="sm" color="secondary" onClick={() => setConfirmRemove(m)}>{t('myClubs.remove') || "O'chirish"}</Button>
                    )}
                  </Row>
                ))}
              </Section>
            )}
          </div>
        )
      )}

      {/* FOLLOWERS — recruit non-member followers into the club */}
      {activeTab === 'followers' && canViewFollowers && (
        followersLoading ? (
          <div className="h-64 rounded-2xl skeleton-shimmer" />
        ) : followers.length === 0 ? (
          <div className="rounded-2xl bg-bg-secondary py-12 text-center text-sm text-fg-tertiary shadow-sm">{t('myClubs.noFollowers') || "Obunachilar yo'q"}</div>
        ) : recruitableFollowers.length === 0 ? (
          <div className="rounded-2xl bg-bg-secondary py-12 text-center text-sm text-fg-tertiary shadow-sm">{t('myClubs.allFollowersMembers') || "Barcha obunachilar allaqachon a'zo"}</div>
        ) : (
          <Section title={t('myClubs.recruit') || "A'zo qilish"} count={recruitableFollowers.length}>
            {recruitableFollowers.map((f) => (
              <Row key={f.public_id} name={f.student_name}>
                {canAdd && memberRole && (
                  <button
                    onClick={() => setConfirmAdd(f)}
                    aria-label={t('myClubs.addMember') || "A'zo qilish"}
                    title={t('myClubs.addMember') || "A'zo qilish"}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm transition-colors hover:bg-brand-700"
                  >
                    <PlusIcon size={16} weight="bold" />
                  </button>
                )}
              </Row>
            ))}
          </Section>
        )
      )}

      {/* Remove confirm */}
      {confirmRemove && (
        <ConfirmModal
          title={t('myClubs.removeTitle') || "A'zoni o'chirasizmi?"}
          name={confirmRemove.student_name}
          desc={t('myClubs.removeDesc') || 'klubdan chiqariladi.'}
          confirmLabel={t('myClubs.remove') || "O'chirish"}
          confirmColor="primary-destructive"
          loading={removing}
          onCancel={() => setConfirmRemove(null)}
          onConfirm={doRemove}
        />
      )}

      {/* Add confirm */}
      {confirmAdd && (
        <ConfirmModal
          title={t('myClubs.addTitle') || "A'zo sifatida qo'shasizmi?"}
          name={confirmAdd.student_name}
          desc={t('myClubs.addDesc') || "klubga a'zo qilib qo'shiladi."}
          confirmLabel={t('myClubs.addMember') || "A'zo qilish"}
          confirmColor="primary"
          loading={adding}
          onCancel={() => setConfirmAdd(null)}
          onConfirm={doAdd}
        />
      )}
    </div>
  );
}

// ── bits ─────────────────────────────────────────────────────────────────────
function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-bg-secondary shadow-sm">
      <div className="flex items-center gap-2 border-b border-border-secondary px-4 py-2.5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-fg-tertiary">{title}</p>
        {count != null && <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[11px] font-semibold text-fg-tertiary">{count}</span>}
      </div>
      <div className="divide-y divide-border-secondary">{children}</div>
    </div>
  );
}

function Row({ name, children }: { name: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <FLAvatar name={name} size={40} />
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-fg-primary">{name}</p>
      {children}
    </div>
  );
}

function ConfirmModal({
  title, name, desc, confirmLabel, confirmColor, loading, onCancel, onConfirm,
}: {
  title: string; name: string; desc: string; confirmLabel: string;
  confirmColor: 'primary' | 'primary-destructive'; loading: boolean;
  onCancel: () => void; onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-bg-secondary p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
          <FLAvatar name={name} size={44} />
        </div>
        <h3 className="text-base font-bold text-fg-primary">{title}</h3>
        <p className="mt-1.5 text-sm text-fg-tertiary"><span className="font-semibold text-fg-secondary">{name}</span> {desc}</p>
        <div className="mt-5 flex gap-3">
          <Button color="secondary" onClick={onCancel} className="flex-1">{t('common.cancel')}</Button>
          <Button color={confirmColor} isLoading={loading} onClick={onConfirm} className="flex-1">{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
