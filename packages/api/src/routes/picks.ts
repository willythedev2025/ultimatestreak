import { Router } from "express";
import { supabase } from "../services/supabase";
import { kalshiClient } from "../services/kalshi";
import type { AuthenticatedRequest } from "../middleware/auth";

export const pickRoutes = Router();

// Get user's active pick
pickRoutes.get("/active", async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from("picks")
    .select("*")
    .eq("user_id", req.userId!)
    .eq("status", "active")
    .single();

  if (error) {
    res.json({ pick: null });
    return;
  }

  res.json({ pick: data });
});

// Get user's pick history for a contest entry
pickRoutes.get("/history/:contestEntryId", async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from("picks")
    .select("*")
    .eq("user_id", req.userId!)
    .eq("contest_entry_id", req.params.contestEntryId)
    .order("picked_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: "Failed to fetch pick history" });
    return;
  }

  res.json({ picks: data });
});

// Make a new pick
pickRoutes.post("/", async (req: AuthenticatedRequest, res) => {
  const { contest_entry_id, market_ticker, predicted_outcome } = req.body;

  // Check for existing active pick
  const { data: activePick } = await supabase
    .from("picks")
    .select("id")
    .eq("user_id", req.userId!)
    .eq("status", "active")
    .single();

  if (activePick) {
    res.status(400).json({ error: "You already have an active pick. Wait for it to settle." });
    return;
  }

  // Fetch market details from Kalshi
  const market = await kalshiClient.getMarket(market_ticker);

  if (market.status !== "open") {
    res.status(400).json({ error: "This market is no longer open for picks." });
    return;
  }

  // Create the pick
  const { data, error } = await supabase
    .from("picks")
    .insert({
      user_id: req.userId!,
      contest_entry_id,
      kalshi_event_ticker: market.event_ticker,
      kalshi_market_ticker: market.ticker,
      event_title: market.title,
      market_title: market.subtitle,
      predicted_outcome,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: "Failed to create pick" });
    return;
  }

  res.status(201).json({ pick: data });
});

