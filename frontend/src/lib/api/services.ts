import { League, Match, PlayerStats, HeadToHead } from '@/types';
import { client } from './client';

export const leagueService = {
  create: (data: { name: string; description?: string }) =>
    client.post<League>('/api/leagues', data),
  
  get: (id: string) =>
    client.get<League>(`/api/leagues/${id}`),
  
  update: (id: string, data: { name: string; description?: string }) =>
    client.put<League>(`/api/leagues/${id}`, data),
};

export const matchService = {
  create: (leagueId: string, data: { player1: string; player2: string; player1_score: number; player2_score: number }) =>
    client.post<Match>(`/api/leagues/${leagueId}/matches`, data),
  
  getAll: (leagueId: string, params?: { limit?: number; offset?: number }) =>
    client.get<Match[]>(`/api/leagues/${leagueId}/matches`, { params }),
  
  update: (id: string, data: { player1_score: number; player2_score: number }) =>
    client.put<Match>(`/api/matches/${id}`, data),
  
  delete: (id: string) =>
    client.delete(`/api/matches/${id}`),
};

export const statsService = {
  getRankings: (leagueId: string) =>
    client.get<PlayerStats[]>(`/api/leagues/${leagueId}/rankings`),
  
  getPlayerStats: (leagueId: string, playerName: string) =>
    client.get<PlayerStats>(`/api/leagues/${leagueId}/players/${playerName}`),
  
  getHeadToHead: (leagueId: string, player1: string, player2: string) =>
    client.get<HeadToHead>(`/api/leagues/${leagueId}/head-to-head/${player1}/${player2}`),
  
  getRecentMatches: (leagueId: string, limit: number = 10) =>
    client.get<Match[]>(`/api/leagues/${leagueId}/recent`, { params: { limit } }),
  
  getLeagueStats: (leagueId: string) =>
    client.get(`/api/leagues/${leagueId}/stats`),
}; 