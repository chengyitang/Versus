'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { mutate } from 'swr';
import axios from 'axios';

interface CreatePlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: string;
}

export function CreatePlayerDialog({
  isOpen,
  onClose,
  leagueId,
}: CreatePlayerDialogProps) {
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      const response = await axios.post(`/api/leagues/${leagueId}/players`, {
        name: playerName.trim(),
      });
      console.log('Create player response:', response.data);

      // Revalidate data
      await mutate(`/api/leagues/${leagueId}/player-stats`);
      await mutate(`/api/leagues/${leagueId}/rankings`);
      await mutate(`/api/leagues/${leagueId}/stats`);

      onClose();
      setPlayerName('');
    } catch (error: any) {
      console.error('Failed to create player:', error);
      if (error.response?.status === 400) {
        setError(error.response?.data?.detail || 'A player with this name already exists in this league');
      } else {
        setError('Failed to create player. Please try again.');
      }
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
            Add New Player
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="playerName"
                className="block text-sm font-medium text-gray-700"
              >
                Player Name
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                required
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

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
                {isSubmitting ? 'Adding...' : 'Add Player'}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 