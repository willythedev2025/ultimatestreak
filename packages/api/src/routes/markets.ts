import { Router } from "express";
import { kalshiClient } from "../services/kalshi";

export const marketRoutes = Router();

// Browse today's pickable markets (public, no auth required)
// Filters: resolves today, open, between 5-95 cents (not a sure thing)
marketRoutes.get("/today", async (_req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const minTs = Math.floor(startOfDay.getTime() / 1000);
    const maxTs = Math.floor(endOfDay.getTime() / 1000);

    let allMarkets: any[] = [];
    let cursor: string | undefined;

    // Paginate through all markets closing today
    do {
      const response = await kalshiClient.getMarkets({
        status: "open",
        min_close_ts: minTs,
        max_close_ts: maxTs,
        limit: 100,
        cursor,
      });

      allMarkets = allMarkets.concat(response.markets);
      cursor = response.cursor ?? undefined;
    } while (cursor);

    // Filter: must have at least 5% chance of NOT happening
    // i.e. last_price between 5 and 95 (cents = probability %)
    const pickableMarkets = allMarkets.filter((m) => {
      const price = m.last_price ?? m.yes_bid ?? 50;
      return price >= 5 && price <= 95;
    });

    res.json({ markets: pickableMarkets, total: pickableMarkets.length });
  } catch (err: any) {
    console.error("Failed to fetch today's markets:", err.message);
    res.status(500).json({ error: "Failed to fetch markets from Kalshi" });
  }
});
