import { getLeaderboard, getCurrentUserRank } from '@/lib/api/student';
import { LeaderboardPodium, LeaderboardRow, YourRankCard } from '@/components/student/LeaderboardComponents';

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
      <div>
        <h1 className="text-2xl font-bold text-fg-primary">Leaderboard</h1>
        <p className="text-fg-secondary mt-1">
          See how you rank against other students
        </p>
      </div>

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
