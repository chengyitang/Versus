'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import type { PlayerStats, Match } from '@/types';
import { fetcher } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Dialog } from '@headlessui/react';
import {
  PlusIcon,
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { CreatePlayerDialog } from '@/components/dialogs/CreatePlayerDialog';

interface HeadToHeadStats {
  total_matches: number;
  match_history: Array<{
    id: string;
    date: string;
    winner: string;
    [key: string]: any; // For dynamic player score fields
  }>;
  [key: string]: any; // For dynamic player stats fields
}

export default function PlayerStats() {
  const params = useParams();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: rankings } = useSWR<PlayerStats[]>(
    `/api/leagues/${params.id}/player-stats`,
    fetcher
  );
  const { data: matches } = useSWR<Match[]>(`/api/leagues/${params.id}/matches?limit=1000`, fetcher);

  if (!rankings || !matches) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Player Stats</h1>
            <p className="mt-2 text-base text-gray-600">
              View detailed statistics for all players
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Player
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rankings.map((player) => {
          // 統計 head-to-head
          const records: Record<string, {w: number, l: number}> = {};
          matches.forEach(match => {
            if (match.player1 === player.player_name || match.player2 === player.player_name) {
              const opponent = match.player1 === player.player_name ? match.player2 : match.player1;
              if (!records[opponent]) records[opponent] = {w: 0, l: 0};
              if (match.winner === player.player_name) {
                records[opponent].w += 1;
              } else {
                records[opponent].l += 1;
              }
            }
          });
          const totalHeadToHeadMatches = Object.values(records).reduce((sum, {w, l}) => sum + w + l, 0);
          return (
            <div
              key={player.player_name}
              className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {player.player_name}
                </h3>
                <div className="flex items-center gap-x-2">
                  <TrophyIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-900">
                    {player.win_rate.toFixed(1)}% Win Rate
                  </span>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Matches</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {player.matches_played}
                  </dd>
                  <dd className="mt-1 text-sm text-gray-500">
                    {player.matches_won}W - {player.matches_lost}L
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Average Score</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {player.average_score.toFixed(1)}
                  </dd>
                  <dd className="mt-1 text-sm text-gray-500">
                    High: {player.highest_score}
                  </dd>
                </div>
              </dl>
              <div className="mt-4">
                <h4 className="text-base font-medium text-gray-900 mb-2">👤 Head-to-head records:</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(records).length === 0 ? (
                    <div className="text-gray-500">No head-to-head records.</div>
                  ) : (
                    Object.entries(records).map(([opponent, {w, l}]) => {
                      const total = w + l;
                      const winRate = total > 0 ? ((w / total) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={opponent}>
                          vs {opponent}: {w}W {l}L <span className="text-gray-500">({winRate}% win rate)</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CreatePlayerDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        leagueId={params.id as string}
      />
    </div>
  );
} 