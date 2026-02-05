interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton rounded-md ${className}`}
      role="presentation"
      aria-hidden="true"
    />
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-bg-secondary rounded-xl border border-border-secondary p-4 space-y-4">
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

// Event Card Skeleton
export function EventCardSkeleton() {
  return (
    <div className="bg-bg-secondary rounded-xl border border-border-secondary overflow-hidden">
      <Skeleton className="h-36 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Announcement Skeleton
export function AnnouncementSkeleton() {
  return (
    <div className="bg-bg-secondary rounded-xl border border-border-secondary p-5 space-y-3">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

// Leaderboard Row Skeleton
export function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-bg-secondary rounded-xl border border-border-secondary">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

// Shop Item Skeleton
export function ShopItemSkeleton() {
  return (
    <div className="bg-bg-secondary rounded-xl border border-border-secondary overflow-hidden">
      <Skeleton className="h-44 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Transaction Skeleton
export function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border-secondary">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
