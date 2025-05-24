'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { League, PlayerStats } from '@/types';
import { fetcher } from '@/lib/api/client';
import {
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function Rankings() {
  const [selectedLeague, setSelectedLeague] = useState<string>();
  const { data: leagues } = useSWR<League[]>('/leagues', fetcher);
  const { data: rankings } = useSWR<PlayerStats[]>(
    selectedLeague ? `/api/leagues/${selectedLeague}/rankings` : null,
    fetcher
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Rankings</h1>
        <p className="mt-2 text-sm text-gray-500">
          View player rankings and statistics by league
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {leagues?.map((league) => (
          <button
            key={league.id}
            onClick={() => setSelectedLeague(league.id)}
            className={`relative overflow-hidden rounded-lg border p-4 text-left transition-colors ${
              selectedLeague === league.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <h3 className="text-lg font-medium text-gray-900">{league.name}</h3>
            {league.description && (
              <p className="mt-1 text-sm text-gray-500">{league.description}</p>
            )}
          </button>
        ))}
      </div>

      {selectedLeague && rankings && (
        <div className="mt-8">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
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
      )}
    </div>
  );
} 