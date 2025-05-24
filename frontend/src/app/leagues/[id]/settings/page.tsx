'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { League, PlayerStats } from '@/types';
import { fetcher } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShareIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function Settings() {
  const params = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: league } = useSWR<League>(`/api/leagues/${params.id}`, fetcher);
  const { data: players, mutate: mutatePlayers } = useSWR<PlayerStats[]>(
    `/api/leagues/${params.id}/player-stats`,
    fetcher
  );
  const { data: rankings } = useSWR<PlayerStats[]>(`/api/leagues/${params.id}/rankings`);

  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false);

  const handleNameEdit = async () => {
    if (!newName.trim()) return;
    
    try {
      await axios.put(`/api/leagues/${params.id}`, {
        name: newName.trim()
      });
      
      // Revalidate data
      await mutate(`/api/leagues/${params.id}`);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update league name:', error);
      alert('Failed to update league name. Please try again.');
    }
  };

  const handleShare = async () => {
    const url = window.location.origin + `/leagues/${params.id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('League link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this league? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`/api/leagues/${params.id}`);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete league:', error);
      alert('Failed to delete league. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleDeletePlayer = async () => {
    if (!selectedPlayer) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedPlayer}? This will also delete all their match records.`
    );

    if (!confirmDelete) return;

    setIsDeletingPlayer(true);
    try {
      await axios.delete(`/api/leagues/${params.id}/players/${selectedPlayer}`);
      await mutatePlayers();
      setSelectedPlayer('');
    } catch (error) {
      console.error('Failed to delete player:', error);
      alert('Failed to delete player. Please try again.');
    } finally {
      setIsDeletingPlayer(false);
    }
  };

  if (!league || !players) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Loading...</h3>
        </div>
      </div>
    );
  }

  const playersWithoutMatches = players.filter(p => p.matches_played === 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5 bg-white">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="mt-2 text-base text-gray-600">
          Manage your league settings
        </p>
      </div>

      <div className="space-y-12">
        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">League Information</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Update your league details and manage league settings.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <Label htmlFor="league-name" className="text-gray-900">League Name</Label>
                <div className="mt-2 flex gap-x-4">
                  {isEditing ? (
                    <>
                      <Input
                        type="text"
                        id="league-name"
                        value={newName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                        className="text-gray-900 bg-white border-gray-900"
                      />
                      <Button onClick={handleNameEdit} className="bg-gray-900 text-white hover:bg-gray-800">Save</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="text-gray-900 border-gray-900">
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-lg text-gray-900">{league.name}</p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setNewName(league.name);
                          setIsEditing(true);
                        }}
                        className="text-gray-900 border-gray-900"
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Share League</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Share your league with others.
            </p>

            <div className="mt-6">
              <Button onClick={handleShare} className="gap-x-2">
                <ShareIcon className="h-5 w-5" />
                Copy League Link
              </Button>
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Delete Player</h2>
            <p className="mt-1 text-sm leading-6 text-gray-900">
              Remove a player from the league.
            </p>

            <div className="space-y-4 mt-8">
              <h2 className="text-lg font-semibold text-gray-900">Delete Player</h2>
              <div className="space-y-2">
                <Label className="text-gray-900">Select Player to Delete</Label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full p-2 border rounded-md text-gray-900"
                >
                  <option value="">Select a player</option>
                  {players?.map((player) => (
                    <option key={player.player_name} value={player.player_name}>
                      {player.player_name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleDeletePlayer}
                  disabled={!selectedPlayer || isDeletingPlayer}
                  variant="outline"
                  className="mt-2 gap-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <TrashIcon className="h-5 w-5" />
                  {isDeletingPlayer ? 'Deleting...' : 'Delete Player'}
                </Button>
              </div>
              <p className="text-sm text-gray-900">
                {players?.length || 0} player(s) in this league
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">Danger Zone</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Once you delete a league, there is no going back. Please be certain.
            </p>

            <div className="mt-6">
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <TrashIcon className="h-5 w-5" />
                Delete League
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 