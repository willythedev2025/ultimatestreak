export interface Contest {
  id: string;
  month: number; // 1-12
  year: number;
  entry_fee_cents: number; // 1000 = $10
  prize_pool_cents: number;
  status: ContestStatus;
  created_at: string;
  updated_at: string;
}

export type ContestStatus = "upcoming" | "active" | "settling" | "completed";

export interface ContestEntry {
  id: string;
  contest_id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  stripe_payment_intent_id: string;
  created_at: string;
  updated_at: string;
}

export interface Leaderboard {
  entries: LeaderboardEntry[];
  contest: Contest;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  rank: number;
}
