'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import useSWR, { mutate } from 'swr';
import { PlayerStats } from '@/types';
import { fetcher } from '@/lib/api/client';
import axios from 'axios';

interface CreateMatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: string;
}

export function CreateMatchDialog({
  isOpen,
  onClose,
  leagueId,
}: CreateMatchDialogProps) {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: players } = useSWR<PlayerStats[]>(
    `/api/leagues/${leagueId}/player-stats`,
    fetcher
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1 || !player2 || !player1Score || !player2Score) return;

    setIsSubmitting(true);
    setError('');
    try {
      await axios.post(`/api/leagues/${leagueId}/matches`, {
        player1,
        player2,
        player1_score: parseInt(player1Score),
        player2_score: parseInt(player2Score),
      });

      // Revalidate data
      await mutate(`/api/leagues/${leagueId}/matches`);
      await mutate(`/api/leagues/${leagueId}/player-stats`);
      await mutate(`/api/leagues/${leagueId}/rankings`);
      await mutate(`/api/leagues/${leagueId}/stats`);

      onClose();
      setPlayer1('');
      setPlayer2('');
      setPlayer1Score('');
      setPlayer2Score('');
    } catch (error: any) {
      console.error('Failed to create match:', error);
      setError(error.response?.data?.detail || 'Failed to create match. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-xl bg-white p-6">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Record New Match
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="player1"
                className="block text-sm font-medium text-gray-700"
              >
                Player 1
              </label>
              <select
                id="player1"
                value={player1}
                onChange={(e) => setPlayer1(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                required
              >
                <option value="">Select player</option>
                {players?.map((player) => (
                  <option
                    key={player.player_name}
                    value={player.player_name}
                    disabled={player.player_name === player2}
                    className="text-gray-900"
                  >
                    {player.player_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="player2"
                className="block text-sm font-medium text-gray-700"
              >
                Player 2
              </label>
              <select
                id="player2"
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                required
              >
                <option value="">Select player</option>
                {players?.map((player) => (
                  <option
                    key={player.player_name}
                    value={player.player_name}
                    disabled={player.player_name === player1}
                    className="text-gray-900"
                  >
                    {player.player_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="player1Score"
                  className="block text-sm font-medium text-gray-700"
                >
                  Player 1 Score
                </label>
                <input
                  type="number"
                  id="player1Score"
                  value={player1Score}
                  onChange={(e) => setPlayer1Score(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="player2Score"
                  className="block text-sm font-medium text-gray-700"
                >
                  Player 2 Score
                </label>
                <input
                  type="number"
                  id="player2Score"
                  value={player2Score}
                  onChange={(e) => setPlayer2Score(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                  min="0"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="border-gray-900 text-gray-900 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Match'}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 