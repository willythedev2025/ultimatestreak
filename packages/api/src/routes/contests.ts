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
