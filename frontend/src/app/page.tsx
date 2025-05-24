'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { League } from '@/types';
import { fetcher } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CreateLeagueDialog } from '@/components/leagues/create-league-dialog';

export default function Home() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: leagues, error } = useSWR<League[]>('/api/leagues', fetcher);

  console.log('Leagues data:', leagues);
  console.log('Error:', error);

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600">Error loading leagues</h3>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!leagues) {
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
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Versus</h1>
        <p className="mt-2 text-base text-gray-600">
          Select a league to view recent matches and statistics, or create a new one
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {leagues.length} league(s) found
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {leagues.map((league) => (
          <Link
            key={league.id}
            href={`/leagues/${league.id}`}
            className="group relative block overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 hover:border-gray-300"
          >
            <h2 className="text-lg font-medium text-gray-900">{league.name}</h2>
            {league.description && (
              <p className="mt-1 text-sm text-gray-500">{league.description}</p>
            )}
          </Link>
        ))}

        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="relative flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center hover:border-gray-400"
        >
          <div>
            <PlusIcon className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Create New League
            </h3>
          </div>
        </button>
      </div>

      <CreateLeagueDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
}
