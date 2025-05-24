'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { League, PlayerStats } from '@/types';
import { fetcher } from '@/lib/api/client';
import {
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function LeaguePage() {
  const params = useParams();
  const { data: league } = useSWR<League>(`/api/leagues/${params.id}`, fetcher);
  const { data: stats } = useSWR(
    league ? `/api/leagues/${league.id}/stats` : null,
    fetcher
  );
  const { data: rankings } = useSWR<PlayerStats[]>(
    `/api/leagues/${params.id}/rankings`,
    fetcher
  );

  if (!league || !rankings) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5 bg-white">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          {league.name}
        </h1>
        {league.description && (
          <p className="mt-2 text-base text-gray-600">{league.description}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Matches</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {stats?.total_matches || 0}
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Players</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {stats?.total_players || 0}
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Average Score</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {stats?.average_score?.toFixed(1) || '0.0'}
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Highest Score</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {stats?.highest_score || 0}
          </dd>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white">
        <ul role="list" className="divide-y divide-gray-200">
          {rankings.map((player, index) => (
            <li
              key={player.player_name}
              className="relative flex items-center justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6"
            >
              <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    <span className="absolute inset-x-0 -top-px bottom-0" />
                    {index + 1}. {player.player_name}
                  </p>
                  <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                    <p>
                      Matches: {player.matches_played} ({player.matches_won}W -{' '}
                      {player.matches_lost}L)
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-x-4">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-x-2">
                    <TrophyIcon
                      className="h-5 w-5 text-yellow-400"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {player.win_rate.toFixed(1)}% Win Rate
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-x-2 text-xs text-gray-500">
                    <FireIcon
                      className="h-4 w-4 text-red-400"
                      aria-hidden="true"
                    />
                    <span>
                      {player.current_streak > 0
                        ? `${player.current_streak} Win Streak`
                        : player.current_streak < 0
                        ? `${Math.abs(player.current_streak)} Loss Streak`
                        : 'No Streak'}
                    </span>
                    <ChartBarIcon
                      className="ml-2 h-4 w-4 text-blue-400"
                      aria-hidden="true"
                    />
                    <span>Avg: {player.average_score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 