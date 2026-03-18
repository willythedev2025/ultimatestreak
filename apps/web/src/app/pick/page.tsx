"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MarketCard } from "@/components/MarketCard";
import { apiFetch, authApiFetch } from "@/lib/api";
import Link from "next/link";

interface Market {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  volume: number;
  status: string;
  close_time: string;
  category: string;
}

interface Contest {
  id: string;
  month: number;
  year: number;
  status: string;
}

interface ContestEntry {
  id: string;
  contest_id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
}

interface PickData {
  id: string;
  status: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  All: "\u{1F30D}",
  Sports: "\u{1F3C0}",
  Crypto: "\u{1F4B0}",
  Economics: "\u{1F4C8}",
  Politics: "\u{1F3DB}\uFE0F",
  Culture: "\u{1F3B5}",
  Climate: "\u{1F321}\uFE0F",
  Other: "\u{2728}",
};

function groupByEvent(markets: Market[]) {
  const groups: Record<string, Market[]> = {};
  for (const m of markets) {
    const key = m.event_ticker || m.ticker;
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  return Object.entries(groups).sort(
    ([, a], [, b]) =>
      b.reduce((s, m) => s + m.volume, 0) -
      a.reduce((s, m) => s + m.volume, 0)
  );
}

export default function PickPage() {
  const { user, session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [markets, setMarkets] = useState<Market[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contestEntry, setContestEntry] = useState<ContestEntry | null>(null);
  const [hasActivePick, setHasActivePick] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    apiFetch<{ markets: Market[]; total: number; categories: string[] }>(
      "/api/markets/today"
    )
      .then((data) => {
        setMarkets(data.markets);
        setCategories(data.categories || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!session?.access_token) return;
    const token = session.access_token;

    async function loadEntry() {
      try {
        const contest = await authApiFetch<Contest>(
          "/api/contests/current",
          token
        );
        const entry = await authApiFetch<ContestEntry>(
          `/api/contests/${contest.id}/entry`,
          token
        );
        setContestEntry(entry);
      } catch {
        // No entry
      }

      try {
        const { pick } = await authApiFetch<{ pick: PickData | null }>(
          "/api/picks/active",
          token
        );
        setHasActivePick(!!pick);
      } catch {
        // fine
      }
    }

    loadEntry();
  }, [session]);

  const filtered = useMemo(() => {
    let result = markets;

    if (activeCategory !== "All") {
      result = result.filter((m) => m.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.subtitle.toLowerCase().includes(q) ||
          m.ticker.toLowerCase().includes(q)
      );
    }

    return result;
  }, [markets, activeCategory, search]);

  const eventGroups = useMemo(() => groupByEvent(filtered), [filtered]);

  // Count markets per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: markets.length };
    for (const m of markets) {
      counts[m.category] = (counts[m.category] || 0) + 1;
    }
    return counts;
  }, [markets]);

  async function handlePick(marketTicker: string, outcome: "yes" | "no") {
    if (!session?.access_token || !contestEntry) return;
    setPickError(null);

    try {
      await authApiFetch("/api/picks", session.access_token, {
        method: "POST",
        body: JSON.stringify({
          contest_entry_id: contestEntry.id,
          market_ticker: marketTicker,
          predicted_outcome: outcome,
        }),
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit pick";
      setPickError(msg);
      throw err;
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-[80vh] px-4 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title mb-1">Today&apos;s Markets</h1>
          <p className="text-sm text-gray-500">
            Choose an event and pick Yes or No. One active pick at a time.
          </p>
        </div>

        {contestEntry && (
          <div className="card px-4 py-2.5 flex items-center gap-2 shrink-0">
            <span className="text-sm">
              {contestEntry.current_streak > 0 ? "\u{1F525}" : "\u{1F9CA}"}
            </span>
            <span className="font-bold text-brand-700 text-lg">
              {contestEntry.current_streak}
            </span>
            <span className="text-xs text-gray-400">streak</span>
          </div>
        )}
      </div>

      {/* Alerts */}
      {!contestEntry && !loading && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-6 flex items-center gap-3">
          <span className="text-amber-500 text-lg">{"\u26A0\uFE0F"}</span>
          <p className="text-sm text-amber-800">
            Join the current contest before making picks.{" "}
            <Link
              href="/dashboard"
              className="underline font-semibold text-amber-900 hover:text-amber-700"
            >
              Go to Dashboard
            </Link>
          </p>
        </div>
      )}

      {hasActivePick && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-sm text-amber-800">
            You already have an active pick. Wait for it to settle.{" "}
            <Link
              href="/dashboard"
              className="underline font-semibold text-amber-900 hover:text-amber-700"
            >
              View your pick
            </Link>
          </p>
        </div>
      )}

      {pickError && (
        <div className="card border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-700">{pickError}</p>
        </div>
      )}

      {/* Category tabs — Kalshi-style */}
      {!loading && !error && markets.length > 0 && (
        <div className="mb-5 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max pb-1">
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-border hover:border-border-dark hover:text-gray-900"
                }`}
              >
                <span className="text-sm">
                  {CATEGORY_ICONS[cat] || "\u{2728}"}
                </span>
                {cat}
                <span
                  className={`text-xs ml-0.5 ${
                    activeCategory === cat ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  {categoryCounts[cat] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      {!loading && !error && markets.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search markets..."
              className="input pl-10"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {filtered.length} market{filtered.length !== 1 ? "s" : ""}{" "}
            {activeCategory !== "All" && `in ${activeCategory}`}
            {search && ` matching "${search}"`}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
          <p className="text-sm text-gray-400">
            Loading markets from Kalshi...
          </p>
        </div>
      )}

      {error && (
        <div className="card border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && markets.length > 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-2">
            No markets found
            {activeCategory !== "All" ? ` in ${activeCategory}` : ""}.
          </p>
          <button
            onClick={() => {
              setActiveCategory("All");
              setSearch("");
            }}
            className="btn-secondary text-sm mt-2"
          >
            Clear filters
          </button>
        </div>
      )}

      {!loading && !error && markets.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-2">
            No pickable markets found for today.
          </p>
          <p className="text-gray-400 text-sm">
            Markets are available when Kalshi has events closing today.
          </p>
        </div>
      )}

      {/* Market groups */}
      {!loading && !error && eventGroups.length > 0 && (
        <div className="space-y-6">
          {eventGroups.map(([eventTicker, eventMarkets]) => (
            <div key={eventTicker}>
              {eventMarkets.length > 1 && (
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm">
                    {CATEGORY_ICONS[eventMarkets[0].category] || "\u{2728}"}
                  </span>
                  <h2 className="text-sm font-semibold text-gray-700 truncate">
                    {eventMarkets[0].title}
                  </h2>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {eventMarkets.length} markets
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              <div className="grid gap-3">
                {eventMarkets.map((market) => (
                  <MarketCard
                    key={market.ticker}
                    market={market}
                    onPick={
                      contestEntry && !hasActivePick ? handlePick : undefined
                    }
                    disabled={hasActivePick || !contestEntry}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
