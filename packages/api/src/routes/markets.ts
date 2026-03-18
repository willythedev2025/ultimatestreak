import { Router } from "express";
import { kalshiClient } from "../services/kalshi";

export const marketRoutes = Router();

// Categorize markets by parsing the event ticker prefix
function categorizeMarket(eventTicker: string, title: string): string {
  const t = eventTicker.toUpperCase();
  const titleLower = title.toLowerCase();

  // Sports
  if (
    t.includes("NBA") ||
    t.includes("NCAAB") ||
    t.includes("NFL") ||
    t.includes("NHL") ||
    t.includes("MLB") ||
    t.includes("MLS") ||
    t.includes("UCL") ||
    t.includes("SOCCER") ||
    t.includes("TENNIS") ||
    titleLower.includes("basketball") ||
    titleLower.includes("football") ||
    titleLower.includes("baseball") ||
    titleLower.includes("hockey") ||
    titleLower.includes("soccer")
  )
    return "Sports";

  // Crypto
  if (
    t.includes("BTC") ||
    t.includes("ETH") ||
    t.includes("SOL") ||
    t.includes("XRP") ||
    t.includes("DOGE") ||
    t.includes("SHIBA") ||
    t.includes("CRYPTO") ||
    titleLower.includes("bitcoin") ||
    titleLower.includes("ethereum") ||
    titleLower.includes("crypto")
  )
    return "Crypto";

  // Financial / Economics
  if (
    t.includes("NASDAQ") ||
    t.includes("SP500") ||
    t.includes("SPX") ||
    t.includes("DOW") ||
    t.includes("RATE") ||
    t.includes("FED") ||
    t.includes("CPI") ||
    t.includes("GDP") ||
    t.includes("JOBS") ||
    t.includes("FOMC") ||
    titleLower.includes("stock") ||
    titleLower.includes("fed") ||
    titleLower.includes("interest rate") ||
    titleLower.includes("inflation")
  )
    return "Economics";

  // Politics
  if (
    t.includes("PRES") ||
    t.includes("SENATE") ||
    t.includes("CONGRESS") ||
    t.includes("ELECTION") ||
    t.includes("PRIM") ||
    t.includes("SCOTUS") ||
    t.includes("CBDECISION") ||
    titleLower.includes("president") ||
    titleLower.includes("senate") ||
    titleLower.includes("political") ||
    titleLower.includes("government")
  )
    return "Politics";

  // Culture / Entertainment
  if (
    t.includes("SPOTIFY") ||
    t.includes("SPOT") ||
    t.includes("OSCAR") ||
    t.includes("GRAMMY") ||
    t.includes("EMMY") ||
    t.includes("STREAM") ||
    t.includes("BILLBOARD") ||
    t.includes("BOX") ||
    titleLower.includes("spotify") ||
    titleLower.includes("streams") ||
    titleLower.includes("movie") ||
    titleLower.includes("music") ||
    titleLower.includes("album")
  )
    return "Culture";

  // Climate / Weather
  if (
    t.includes("TEMP") ||
    t.includes("WEATHER") ||
    t.includes("CLIMATE") ||
    t.includes("HURRICANE") ||
    titleLower.includes("temperature") ||
    titleLower.includes("weather")
  )
    return "Climate";

  return "Other";
}

// Browse today's pickable markets (public, no auth required)
// Filters: resolves today, open, between 5-95 cents (not a sure thing)
marketRoutes.get("/today", async (_req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const minTs = Math.floor(startOfDay.getTime() / 1000);
    const maxTs = Math.floor(endOfDay.getTime() / 1000);

    let allMarkets: any[] = [];
    let cursor: string | undefined;
    const MAX_PAGES = 5;
    let page = 0;

    // Paginate through markets closing today (max 200 per page)
    do {
      const response = await kalshiClient.getMarkets({
        status: "open",
        min_close_ts: minTs,
        max_close_ts: maxTs,
        limit: 200,
        cursor,
      });

      allMarkets = allMarkets.concat(response.markets);
      cursor = response.cursor ?? undefined;
      page++;
    } while (cursor && page < MAX_PAGES);

    // Filter: must have at least 5% chance of NOT happening
    const pickableMarkets = allMarkets.filter((m) => {
      const price = parseFloat(
        m.last_price_dollars ?? m.yes_bid_dollars ?? "0.50"
      );
      return price >= 0.05 && price <= 0.95;
    });

    // Normalize fields for the frontend
    const normalized = pickableMarkets.map((m) => ({
      ticker: m.ticker,
      event_ticker: m.event_ticker,
      title: m.title,
      subtitle: m.subtitle || m.custom_strike?.Word || "",
      yes_bid: Math.round(parseFloat(m.yes_bid_dollars || "0") * 100),
      yes_ask: Math.round(parseFloat(m.yes_ask_dollars || "0") * 100),
      no_bid: Math.round(parseFloat(m.no_bid_dollars || "0") * 100),
      no_ask: Math.round(parseFloat(m.no_ask_dollars || "0") * 100),
      last_price: Math.round(parseFloat(m.last_price_dollars || "0") * 100),
      volume: parseInt(m.volume_fp || m.open_interest_fp || "0", 10),
      status: m.status,
      close_time: m.close_time,
      category: categorizeMarket(m.event_ticker || "", m.title || ""),
    }));

    // Collect available categories
    const categories = [
      ...new Set(normalized.map((m) => m.category)),
    ].sort();

    res.json({ markets: normalized, total: normalized.length, categories });
  } catch (err: any) {
    console.error("Failed to fetch today's markets:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch markets from Kalshi", detail: err.message });
  }
});
