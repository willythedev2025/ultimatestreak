import { Router } from "express";
import { supabase } from "../services/supabase";

export const leaderboardRoutes = Router();

// Get leaderboard for a contest
leaderboardRoutes.get("/:contestId", async (req, res) => {
  const { data, error } = await supabase
    .from("contest_entries")
    .select(`
      user_id,
      current_streak,
      longest_streak,
      users ( display_name, avatar_url )
    `)
    .eq("contest_id", req.params.contestId)
    .order("longest_streak", { ascending: false })
    .limit(50);

  if (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
    return;
  }

  const entries = (data || []).map((entry: any, index: number) => ({
    user_id: entry.user_id,
    display_name: entry.users?.display_name ?? "Anonymous",
    avatar_url: entry.users?.avatar_url ?? null,
    current_streak: entry.current_streak,
    longest_streak: entry.longest_streak,
    rank: index + 1,
  }));

  res.json({ entries });
});
