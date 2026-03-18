import { Router, Request, Response } from "express";
import { supabase } from "../services/supabase";

export const adminRoutes = Router();

// Simple admin secret check
function requireAdminSecret(req: Request, res: Response, next: () => void) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    res.status(500).json({ error: "ADMIN_SECRET not configured" });
    return;
  }

  const provided = req.headers["x-admin-secret"];
  if (provided !== secret) {
    res.status(403).json({ error: "Invalid admin secret" });
    return;
  }

  next();
}

adminRoutes.use(requireAdminSecret);

// Seed contest for a given month/year, or current month by default
adminRoutes.post("/seed-contest", async (req: Request, res: Response) => {
  const now = new Date();
  const month = req.body.month ?? now.getMonth() + 1;
  const year = req.body.year ?? now.getFullYear();
  const entryFeeCents = req.body.entry_fee_cents ?? 1000;

  // Check if contest already exists
  const { data: existing } = await supabase
    .from("contests")
    .select("id, status")
    .eq("month", month)
    .eq("year", year)
    .single();

  if (existing) {
    res.status(409).json({
      error: "Contest already exists",
      contest: existing,
    });
    return;
  }

  const { data, error } = await supabase
    .from("contests")
    .insert({
      month,
      year,
      entry_fee_cents: entryFeeCents,
      prize_pool_cents: 0,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: "Failed to create contest", details: error.message });
    return;
  }

  res.status(201).json({ contest: data });
});
