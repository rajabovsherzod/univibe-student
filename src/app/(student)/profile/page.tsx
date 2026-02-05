'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStudent } from '@/lib/api/student';
import { type Student } from '@/types/student';
import { Button } from '@/components/ui/Button';
import { CoinPill } from '@/components/student/CoinPill';
import { RankChip } from '@/components/student/RankChip';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import {
  Mail,
  GraduationCap,
  Users,
  Calendar,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  Wallet,
  Trophy,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadProfile();
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getStudent();
      setStudent(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  const handleLogout = () => {
    // Mock logout - in real app would clear auth
    router.push('/');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-fg-primary">Profile</h1>
        <ProfileSkeleton />
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-fg-primary">Profile</h1>

      {/* Student Card */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden bg-brand-400 flex-shrink-0">
            {student.avatar ? (
              <img src={student.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                {student.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{student.name}</h2>
            <p className="text-brand-200 text-sm truncate">{student.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <CoinPill amount={student.coins} size="sm" />
              <RankChip rank={student.rank} previousRank={student.previousRank} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard icon={GraduationCap} label="Faculty" value={student.faculty} />
        <InfoCard icon={Users} label="Group" value={student.group} />
        <InfoCard icon={Calendar} label="Year" value={`Year ${student.year}`} />
        <InfoCard icon={Mail} label="Email" value={student.email} />
      </div>

      {/* Stats */}
      <div className="bg-bg-secondary rounded-xl border border-border-secondary p-4">
        <h3 className="font-semibold text-fg-primary mb-4">Quick Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
              {student.coins.toLocaleString()}
            </p>
            <p className="text-sm text-fg-tertiary">Coins</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
              #{student.rank}
            </p>
            <p className="text-sm text-fg-tertiary">Rank</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
              {student.badges.length}
            </p>
            <p className="text-sm text-fg-tertiary">Badges</p>
          </div>
        </div>
      </div>

      {/* Achievements / Badges */}
      {student.badges.length > 0 && (
        <div className="bg-bg-secondary rounded-xl border border-border-secondary p-4">
          <h3 className="font-semibold text-fg-primary mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Achievements
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {student.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center text-center p-3 rounded-lg bg-bg-tertiary"
                title={badge.description}
              >
                <span className="text-3xl mb-2">{badge.icon}</span>
                <p className="text-xs font-medium text-fg-primary line-clamp-2">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="space-y-2">
        <QuickLink icon={Wallet} label="Wallet" href="/wallet" />
        <QuickLink icon={Trophy} label="Leaderboard" href="/leaderboard" />
      </div>

      {/* Settings */}
      <div className="bg-bg-secondary rounded-xl border border-border-secondary overflow-hidden">
        <h3 className="font-semibold text-fg-primary p-4 border-b border-border-secondary">
          Settings
        </h3>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="
            w-full flex items-center justify-between p-4
            hover:bg-bg-tertiary transition-colors
            focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900 focus-visible:ring-inset
          "
        >
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-fg-tertiary" /> : <Sun className="w-5 h-5 text-fg-tertiary" />}
            <span className="text-fg-primary">Theme</span>
          </div>
          <span className="text-sm text-fg-secondary">{isDark ? 'Dark' : 'Light'}</span>
        </button>
      </div>

      {/* Logout */}
      <Button
        variant="danger"
        fullWidth
        onClick={handleLogout}
        leftIcon={<LogOut className="w-5 h-5" />}
      >
        Log Out
      </Button>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-bg-secondary rounded-xl border border-border-secondary">
      <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
        <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-fg-tertiary">{label}</p>
        <p className="font-medium text-fg-primary truncate">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="
        flex items-center justify-between p-4 bg-bg-secondary rounded-xl border border-border-secondary
        hover:border-border-brand transition-colors
        focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
      "
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-fg-tertiary" />
        <span className="font-medium text-fg-primary">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-fg-tertiary" />
    </a>
  );
}
