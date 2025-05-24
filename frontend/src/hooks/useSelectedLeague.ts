import { create } from 'zustand';
import { League } from '@/types';

interface SelectedLeagueStore {
  selectedLeague: League | null;
  setSelectedLeague: (league: League | null) => void;
}

export const useSelectedLeague = create<SelectedLeagueStore>((set) => ({
  selectedLeague: null,
  setSelectedLeague: (league: League | null) => set({ selectedLeague: league }),
})); 