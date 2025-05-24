'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { Match } from '@/types';
import { fetcher } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CreateMatchDialog } from '@/components/dialogs/CreateMatchDialog';
import axios from 'axios';

export default function Matches() {
  const params = useParams();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { data: matches } = useSWR<Match[]>(
    `/api/leagues/${params.id}/matches`,
    fetcher
  );

  const handleDelete = async (matchId: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    
    setIsDeleting(matchId);
    try {
      await axios.delete(`/api/matches/${matchId}`);
      
      // Revalidate all affected data
      await mutate(`/api/leagues/${params.id}/matches`);
      await mutate(`/api/leagues/${params.id}/player-stats`);
      await mutate(`/api/leagues/${params.id}/rankings`);
      await mutate(`/api/leagues/${params.id}/stats`);
    } catch (error) {
      console.error('Failed to delete match:', error);
      alert('Failed to delete match. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  if (!matches) {
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
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Matches</h1>
            <p className="mt-2 text-base text-gray-600">
              View match history and record new matches
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Match
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white">
        {matches.length > 0 ? (
          <ul role="list" className="divide-y divide-gray-200">
            {matches.map((match) => (
              <li key={match.id} className="px-6 py-5 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="min-w-0">
                      <p className="text-base font-medium text-gray-900">
                        {match.player1} vs {match.player2}
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {match.player1_score} - {match.player2_score}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        match.winner === match.player1
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {match.winner} won
                    </span>
                    <time className="text-sm font-medium text-gray-500">
                      {new Date(match.created_at).toLocaleDateString()}
                    </time>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(match.id)}
                      disabled={isDeleting === match.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 p-2"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-8 text-center text-base text-gray-600">
            No matches found in this league yet
          </div>
        )}
      </div>

      <CreateMatchDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        leagueId={params.id as string}
      />
    </div>
  );
} 