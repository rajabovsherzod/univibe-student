import { type LeaderboardEntry } from '@/types/student';
import { RankPosition, RankChip } from './RankChip';
import { CoinPill } from './CoinPill';
import { TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react';

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  // Get top 3 entries, reorder for podium display: 2nd, 1st, 3rd
  const [first, second, third] = entries.slice(0, 3);
  const podiumOrder = [second, first, third].filter(Boolean);

  return (
    <div className="flex items-end justify-center gap-4 py-6">
      {podiumOrder.map((entry, index) => {
        const position = index === 0 ? 2 : index === 1 ? 1 : 3;
        const height = position === 1 ? 'h-32' : position === 2 ? 'h-24' : 'h-20';

        return (
          <div
            key={entry.student.id}
            className="flex flex-col items-center"
          >
            {/* Avatar & Info */}
            <div className="relative mb-2">
              <div
                className={`
                  w-16 h-16 rounded-full border-4 overflow-hidden
                  ${position === 1 ? 'border-amber-400 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30' : ''}
                  ${position === 2 ? 'border-gray-400 shadow-md' : ''}
                  ${position === 3 ? 'border-orange-500 shadow-md' : ''}
                `}
              >
                {entry.student.avatar ? (
                  <img
                    src={entry.student.avatar}
                    alt={entry.student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-xl font-bold text-brand-600 dark:text-brand-400">
                    {entry.student.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                <RankPosition rank={position as 1 | 2 | 3} size="sm" />
              </div>
            </div>

            <p className="text-sm font-semibold text-fg-primary text-center max-w-20 truncate mt-2">
              {entry.student.name}
            </p>
            <p className="text-xs text-fg-tertiary mb-2">{entry.student.faculty}</p>
            <CoinPill amount={entry.coins} size="sm" />

            {/* Podium Stand */}
            <div
              className={`
                mt-3 w-20 ${height} rounded-t-lg flex items-center justify-center
                ${position === 1 ? 'bg-gradient-to-b from-amber-400 to-amber-500' : ''}
                ${position === 2 ? 'bg-gradient-to-b from-gray-300 to-gray-400' : ''}
                ${position === 3 ? 'bg-gradient-to-b from-orange-400 to-orange-500' : ''}
              `}
            >
              <Trophy className={`w-6 h-6 ${position === 1 ? 'text-amber-100' : position === 2 ? 'text-gray-100' : 'text-orange-100'}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Leaderboard Row for the list
interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

export function LeaderboardRow({ entry, isCurrentUser = false }: LeaderboardRowProps) {
  const movement = entry.previousRank ? entry.previousRank - entry.rank : 0;
  const isUp = movement > 0;
  const isDown = movement < 0;
  const isStable = movement === 0;

  return (
    <div
      className={`
        flex items-center gap-4 p-4 rounded-xl border transition-colors
        ${isCurrentUser
          ? 'bg-brand-50 dark:bg-brand-950/50 border-brand-200 dark:border-brand-800'
          : 'bg-bg-secondary border-border-secondary hover:border-border-brand'
        }
      `}
    >
      {/* Rank */}
      <div className="w-10 text-center">
        <span className={`text-lg font-bold ${isCurrentUser ? 'text-brand-600 dark:text-brand-400' : 'text-fg-primary'}`}>
          #{entry.rank}
        </span>
      </div>

      {/* Movement Indicator */}
      <div className="w-8 flex justify-center">
        {entry.previousRank !== undefined && (
          <span
            className={`
              flex items-center gap-0.5 text-sm font-medium
              ${isUp ? 'text-success-600 dark:text-success-400' : ''}
              ${isDown ? 'text-error-600 dark:text-error-400' : ''}
              ${isStable ? 'text-fg-tertiary' : ''}
            `}
          >
            {isUp && <TrendingUp className="w-4 h-4" />}
            {isDown && <TrendingDown className="w-4 h-4" />}
            {isStable && <Minus className="w-4 h-4" />}
            {movement !== 0 && Math.abs(movement)}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-tertiary flex-shrink-0">
        {entry.student.avatar ? (
          <img
            src={entry.student.avatar}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-sm font-bold text-brand-600 dark:text-brand-400">
            {entry.student.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isCurrentUser ? 'text-brand-700 dark:text-brand-300' : 'text-fg-primary'}`}>
          {entry.student.name}
          {isCurrentUser && <span className="text-sm text-fg-tertiary ml-2">(You)</span>}
        </p>
        <p className="text-sm text-fg-tertiary">{entry.student.faculty}</p>
      </div>

      {/* Stats */}
      <div className="text-right flex-shrink-0">
        <CoinPill amount={entry.coins} size="sm" />
        <p className="text-xs text-fg-tertiary mt-1">
          {entry.eventsAttended} events
        </p>
      </div>
    </div>
  );
}

// Your Rank Card (sticky at bottom)
interface YourRankCardProps {
  entry: LeaderboardEntry;
}

export function YourRankCard({ entry }: YourRankCardProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 p-4 bg-bg-primary/80 backdrop-blur-sm border-t border-border-secondary">
      <LeaderboardRow entry={entry} isCurrentUser />
    </div>
  );
}

export default LeaderboardPodium;
