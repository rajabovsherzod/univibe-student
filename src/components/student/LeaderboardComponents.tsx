'use client';

import { type LeaderboardEntry } from '@/types/student';
import { RankPosition, RankChip } from './RankChip';
import { CoinPill } from './CoinPill';
import { TrendUp, TrendDown, Minus, Trophy } from '@phosphor-icons/react';

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  // Get top 3 entries, reorder for podium display: 2nd, 1st, 3rd
  const [first, second, third] = entries.slice(0, 3);
  const podiumOrder = [second, first, third].filter(Boolean);

  // Map position to CoinPill variant
  const getCoinVariant = (position: number): 'gold' | 'silver' | 'bronze' => {
    if (position === 1) return 'gold';
    if (position === 2) return 'silver';
    return 'bronze';
  };

  // Podium styling per position
  const getPodiumStyles = (position: number) => {
    const styles = {
      1: {
        height: 'h-36 sm:h-44 lg:h-52',
        gradient: 'from-amber-400 via-yellow-400 to-amber-500',
        shelfGradient: 'from-amber-300 to-amber-400',
        borderColor: 'border-amber-500/50',
        shadowColor: 'shadow-amber-400/30',
        trophyColor: 'text-amber-100',
        shineColor: 'from-white/30',
      },
      2: {
        height: 'h-28 sm:h-36 lg:h-44',
        gradient: 'from-gray-300 via-gray-200 to-gray-400',
        shelfGradient: 'from-gray-200 to-gray-300',
        borderColor: 'border-gray-400/50',
        shadowColor: 'shadow-gray-400/20',
        trophyColor: 'text-gray-600',
        shineColor: 'from-white/40',
      },
      3: {
        height: 'h-24 sm:h-32 lg:h-40',
        gradient: 'from-orange-400 via-amber-400 to-orange-500',
        shelfGradient: 'from-orange-300 to-orange-400',
        borderColor: 'border-orange-500/50',
        shadowColor: 'shadow-orange-400/30',
        trophyColor: 'text-orange-100',
        shineColor: 'from-white/30',
      },
    };
    return styles[position as 1 | 2 | 3];
  };

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4 lg:gap-6 py-8 px-2 sm:px-4 lg:px-8 w-full max-w-4xl mx-auto">
      {podiumOrder.map((entry, index) => {
        const position = index === 0 ? 2 : index === 1 ? 1 : 3;
        const coinVariant = getCoinVariant(position);
        const podiumStyle = getPodiumStyles(position);

        return (
          <div
            key={entry.student.id}
            className="flex flex-col items-center flex-1"
          >
            {/* Avatar & Info */}
            <div className="relative mb-3">
              <div
                className={`
                  w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-4 overflow-hidden
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
                  <div className="w-full h-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-xl sm:text-2xl lg:text-3xl font-bold text-brand-600 dark:text-brand-400">
                    {entry.student.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <RankPosition rank={position as 1 | 2 | 3} size="sm" />
              </div>
            </div>

            <p className="text-sm sm:text-base font-semibold text-fg-primary text-center max-w-full truncate mt-1 px-1">
              {entry.student.name}
            </p>
            <p className="text-xs sm:text-sm text-fg-tertiary mb-2">{entry.student.faculty}</p>
            <CoinPill amount={entry.coins} size="sm" variant={coinVariant} />

            {/* Premium Podium Stand */}
            <div className="mt-4 w-full relative">
              {/* Main podium body */}
              <div
                className={`
                  w-full ${podiumStyle.height} rounded-t-2xl relative overflow-hidden
                  bg-gradient-to-b ${podiumStyle.gradient}
                  border-t-2 border-l-2 border-r-2 ${podiumStyle.borderColor}
                  shadow-lg ${podiumStyle.shadowColor}
                `}
              >
                {/* Shine effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${podiumStyle.shineColor} via-transparent to-transparent`} />

                {/* Trophy shelf/pedestal */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  {/* Small shelf base */}
                  <div className={`w-12 sm:w-14 lg:w-16 h-8 sm:h-10 lg:h-12 rounded-lg bg-gradient-to-b ${podiumStyle.shelfGradient} shadow-md flex items-center justify-center border ${podiumStyle.borderColor}`}>
                    <span className={podiumStyle.trophyColor}>
                      <Trophy size={24} weight="fill" />
                    </span>
                  </div>
                  {/* Shelf support */}
                  <div className={`w-8 sm:w-10 lg:w-12 h-2 bg-gradient-to-b ${podiumStyle.shelfGradient} rounded-b-sm shadow-sm`} />
                </div>

                {/* Position number at bottom */}
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2">
                  <span className={`text-2xl sm:text-3xl lg:text-4xl font-black ${podiumStyle.trophyColor} drop-shadow-sm`}>
                    {position}
                  </span>
                </div>
              </div>
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
        flex items-center gap-4 p-4 rounded-xl border shadow-sm transition-colors
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
            {isUp && <TrendUp size={16} weight="bold" />}
            {isDown && <TrendDown size={16} weight="bold" />}
            {isStable && <Minus size={16} />}
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

      {/* Stats - use primary (blue) variant for rows below podium */}
      <div className="text-right flex-shrink-0">
        <CoinPill amount={entry.coins} size="sm" variant="primary" />
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
    <div className="sticky bottom-0 left-0 right-0 p-4 bg-bg-primary/80 backdrop-blur-sm border-t border-border-secondary shadow-lg">
      <LeaderboardRow entry={entry} isCurrentUser />
    </div>
  );
}

export default LeaderboardPodium;
