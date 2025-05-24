export interface League {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface Match {
  id: string;
  league_id: string;
  player1: string;
  player2: string;
  player1_score: number;
  player2_score: number;
  winner: string;
  created_at: string;
  updated_at?: string;
}

export interface PlayerStats {
  player_name: string;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  total_score: number;
  win_rate: number;
  average_score: number;
  highest_score: number;
  win_streak: number;
  current_streak: number;
}

export interface HeadToHead {
  total_matches: number;
  [key: string]: number | string | any[];
  match_history: Array<{
    id: string;
    date: string;
    [key: string]: string | number;
  }>;
  average_score_difference: number;
} 