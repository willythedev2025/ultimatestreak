"use client";

import { useEffect, useState } from "react";
import { MarketCard } from "@/components/MarketCard";

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
  expiration_time: string;
}

export default function PickPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/markets/today")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch markets");
        return res.json();
      })
      .then((data) => {
        setMarkets(data.markets);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Today&apos;s Picks</h1>
        <p className="text-gray-400">
          Choose an event resolving today. You can only have one active pick at a time.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500" />
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && markets.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No pickable markets found for today. Check back later.
        </div>
      )}

      {!loading && !error && markets.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {markets.length} market{markets.length !== 1 ? "s" : ""} available
          </p>
          <div className="grid gap-4">
            {markets.map((market) => (
              <MarketCard key={market.ticker} market={market} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
