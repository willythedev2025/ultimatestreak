import { Router } from "express";
import { supabase } from "../services/supabase";
import type { AuthenticatedRequest } from "../middleware/auth";

export const contestRoutes = Router();

// Get the current active contest
contestRoutes.get("/current", async (_req, res) => {
  const { data, error } = await supabase
    .from("contests")
    .select("*")
    .eq("status", "active")
    .single();

  if (error) {
    res.status(404).json({ error: "No active contest found" });
    return;
  }

  res.json(data);
});

// Get user's entry for a contest
contestRoutes.get("/:contestId/entry", async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from("contest_entries")
    .select("*")
    .eq("contest_id", req.params.contestId)
    .eq("user_id", req.userId!)
    .single();

  if (error) {
    res.status(404).json({ error: "No entry found" });
    return;
  }

  res.json(data);
});

// Free join - bypass payment for testing
contestRoutes.post("/:contestId/join-free", async (req: AuthenticatedRequest, res) => {
  const { contestId } = req.params;

  // Check if already entered
  const { data: existing } = await supabase
    .from("contest_entries")
    .select("id")
    .eq("contest_id", contestId)
    .eq("user_id", req.userId!)
    .single();

  if (existing) {
    res.status(400).json({ error: "Already entered this contest" });
    return;
  }

  const { data, error } = await supabase
    .from("contest_entries")
    .insert({
      contest_id: contestId,
      user_id: req.userId!,
      current_streak: 0,
      longest_streak: 0,
      stripe_payment_intent_id: "free_entry",
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: "Failed to join contest", details: error.message });
    return;
  }

  res.status(201).json(data);
});
