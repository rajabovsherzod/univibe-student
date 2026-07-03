'use client';

import Image from 'next/image';
import { toHttps } from '@/utils/cx';

/** "First Last" → "FL" (first letters of first + last name). */
export function initialsFL(name?: string | null): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Round avatar — image if present, else a brand-filled circle with white FL initials. */
export function FLAvatar({ src, name, size = 40 }: { src?: string | null; name?: string | null; size?: number }) {
  const url = toHttps(src);
  return (
    <div className="shrink-0 overflow-hidden rounded-full bg-brand-600" style={{ width: size, height: size }}>
      {url ? (
        <Image src={url} alt={name || ''} width={size} height={size} className="size-full object-cover" unoptimized />
      ) : (
        <div className="flex size-full select-none items-center justify-center font-bold text-white" style={{ fontSize: Math.round(size * 0.4) }}>
          {initialsFL(name)}
        </div>
      )}
    </div>
  );
}

/** Solid, borderless role badge — owner = amber, other leaders = brand. */
export function RoleBadge({ code, roleName, t }: { code: string; roleName?: string | null; t: (k: string) => string }) {
  const isOwner = code === 'OWNER';
  const cls = isOwner ? 'bg-amber-500 text-white' : 'bg-brand-600 text-white';
  const label = isOwner ? (t('myClubs.owner') || 'Rahbar') : (roleName || t('myClubs.leader') || 'Boshqaruvchi');
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm ${cls}`}>{label}</span>;
}
