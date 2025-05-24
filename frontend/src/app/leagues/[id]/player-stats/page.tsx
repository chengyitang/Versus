'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import type { PlayerStats } from '@/types';
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
  const [selectedPlayers, setSelectedPlayers] = useState<[string, string] | null>(null);
  const { data: rankings } = useSWR<PlayerStats[]>(
    `/api/leagues/${params.id}/player-stats`,
    fetcher
  );
  const { data: headToHead } = useSWR<HeadToHeadStats>(
    selectedPlayers ? `/api/leagues/${params.id}/head-to-head/${encodeURIComponent(selectedPlayers[0])}/${encodeURIComponent(selectedPlayers[1])}` : null,
    fetcher
  );

  if (!rankings) {
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
        {rankings.map((player) => (
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

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-x-2 text-sm text-gray-500">
                <FireIcon className="h-4 w-4 text-red-400" aria-hidden="true" />
                <span>
                  {player.current_streak > 0
                    ? `${player.current_streak} Win Streak`
                    : player.current_streak < 0
                    ? `${Math.abs(player.current_streak)} Loss Streak`
                    : 'No Streak'}
                </span>
                <span className="mx-2">•</span>
                <span>Best: {player.win_streak} Wins</span>
              </div>
              {player.matches_played > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedPlayers([player.player_name, ''])}
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200 text-sm"
                >
                  View Head-to-Head
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreatePlayerDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        leagueId={params.id as string}
      />

      {/* Head-to-Head Dialog */}
      <Dialog 
        open={selectedPlayers !== null} 
        onClose={() => setSelectedPlayers(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-xl bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-4">
              Head-to-Head Statistics
            </Dialog.Title>

            {selectedPlayers && (
              <div className="mt-4">
                {selectedPlayers[1] === '' ? (
                  // Player selection view
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Select a player to compare with {selectedPlayers[0]}
                    </p>
                    <div className="grid gap-2">
                      {rankings
                        .filter(p => p.player_name !== selectedPlayers[0] && p.matches_played > 0)
                        .map(player => (
                          <button
                            key={player.player_name}
                            onClick={() => setSelectedPlayers([selectedPlayers[0], player.player_name])}
                            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-left"
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {player.player_name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {player.matches_played} matches played
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                ) : headToHead ? (
                  // Head-to-head stats view
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">{selectedPlayers[0]}</h3>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm text-gray-500">Wins</dt>
                            <dd className="text-2xl font-semibold text-gray-900">
                              {headToHead[`${selectedPlayers[0]}_wins`]}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Win Rate</dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {headToHead[`${selectedPlayers[0]}_win_rate`].toFixed(1)}%
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Average Score</dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {headToHead[`${selectedPlayers[0]}_average_score`].toFixed(1)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">{selectedPlayers[1]}</h3>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm text-gray-500">Wins</dt>
                            <dd className="text-2xl font-semibold text-gray-900">
                              {headToHead[`${selectedPlayers[1]}_wins`]}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Win Rate</dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {headToHead[`${selectedPlayers[1]}_win_rate`].toFixed(1)}%
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Average Score</dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {headToHead[`${selectedPlayers[1]}_average_score`].toFixed(1)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Match History</h3>
                      <div className="space-y-2">
                        {headToHead.match_history.map((match) => (
                          <div
                            key={match.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                          >
                            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center w-full">
                              <div className="text-right">
                                <span className={`font-medium ${match.winner === selectedPlayers[0] ? 'text-green-600' : 'text-gray-900'}`}>
                                  {selectedPlayers[0]}
                                </span>
                                <div className="text-sm text-gray-500">
                                  {match[`${selectedPlayers[0]}_score`]} pts
                                </div>
                              </div>
                              <div className="text-sm text-gray-500 text-center">vs</div>
                              <div>
                                <span className={`font-medium ${match.winner === selectedPlayers[1] ? 'text-green-600' : 'text-gray-900'}`}>
                                  {selectedPlayers[1]}
                                </span>
                                <div className="text-sm text-gray-500">
                                  {match[`${selectedPlayers[1]}_score`]} pts
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">Loading...</p>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPlayers(null)}
                    className="border-gray-900 text-gray-900 hover:bg-gray-100"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 