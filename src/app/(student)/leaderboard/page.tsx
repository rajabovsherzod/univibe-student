import { Trophy } from '@phosphor-icons/react/dist/ssr';
import { getLeaderboard, getCurrentUserRank } from '@/lib/api/student';
import { LeaderboardPodium, LeaderboardRow, YourRankCard } from '@/components/student/LeaderboardComponents';
import { PageHeader } from '@/components/student/PageHeader';

export default async function LeaderboardPage() {
  const [leaderboard, currentUserRank] = await Promise.all([
    getLeaderboard(),
    getCurrentUserRank(),
  ]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Leaderboard"
        subtitle="See how you rank against other students"
        icon={Trophy}
      />

      {/* Podium - Top 3 */}
      <div className="bg-bg-secondary rounded-2xl border border-border-secondary p-6">
        <LeaderboardPodium entries={top3} />
      </div>

      {/* Top 20 List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-fg-primary">Top 20</h2>
        <div className="space-y-2">
          {rest.map((entry) => (
            <LeaderboardRow
              key={entry.student.id}
              entry={entry}
              isCurrentUser={currentUserRank?.student.id === entry.student.id}
            />
          ))}
        </div>
      </div>

      {/* Your Rank (if not in top 20) */}
      {currentUserRank && currentUserRank.rank > 20 && (
        <YourRankCard entry={currentUserRank} />
      )}
    </div>
  );
}
