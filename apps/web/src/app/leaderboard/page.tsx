"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, authApiFetch } from "@/lib/api";

interface Contest {
  id: string;
  month: number;
  year: number;
  prize_pool_cents: number;
  status: string;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  rank: number;
}

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString()}`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-bold text-sm border border-yellow-200">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm border border-gray-200">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-sm border border-amber-200">
        3
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 text-gray-400 font-semibold text-sm">
      {rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const { user, session } = useAuth();

  const [contest, setContest] = useState<Contest | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        let c: Contest;
        if (session?.access_token) {
          c = await authApiFetch<Contest>(
            "/api/contests/current",
            session.access_token
          );
        } else {
          c = await apiFetch<Contest>("/api/contests/current");
        }
        setContest(c);

        const data = await apiFetch<{ entries: LeaderboardEntry[] }>(
          `/api/leaderboard/${c.id}`
        );
        setEntries(data.entries);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load leaderboard"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [session]);

  return (
    <main className="min-h-[80vh] px-4 py-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title mb-1">Leaderboard</h1>
          {contest && (
            <p className="text-sm text-gray-500">
              {MONTH_NAMES[contest.month]} {contest.year}
            </p>
          )}
        </div>

        {contest && (
          <div className="card px-5 py-3 text-center shrink-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-0.5">
              Prize Pool
            </p>
            <p className="text-2xl font-black text-brand-600">
              {formatCents(contest.prize_pool_cents)}
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="card border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-1">No entries yet.</p>
          <p className="text-gray-400 text-sm">Be the first to join!</p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[56px_1fr_100px_100px] sm:grid-cols-[72px_1fr_120px_120px] gap-2 px-5 py-3 border-b border-border text-[10px] text-gray-400 uppercase tracking-widest font-medium bg-surface-1">
            <span>Rank</span>
            <span>Player</span>
            <span className="text-right">Current</span>
            <span className="text-right">Longest</span>
          </div>

          {entries.map((entry) => {
            const isCurrentUser = user?.id === entry.user_id;
            return (
              <div
                key={entry.user_id}
                className={`grid grid-cols-[56px_1fr_100px_100px] sm:grid-cols-[72px_1fr_120px_120px] gap-2 px-5 py-3.5 items-center transition-colors ${
                  isCurrentUser
                    ? "bg-brand-50 border-l-2 border-l-brand-500"
                    : "border-b border-gray-50 hover:bg-surface-1"
                }`}
              >
                <div className="flex justify-center">
                  <RankBadge rank={entry.rank} />
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  {entry.avatar_url ? (
                    <img
                      src={entry.avatar_url}
                      alt=""
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-xs font-semibold flex-shrink-0 uppercase text-gray-500 border border-border">
                      {entry.display_name?.charAt(0) || "?"}
                    </div>
                  )}
                  <span
                    className={`truncate text-sm ${
                      isCurrentUser
                        ? "font-semibold text-brand-700"
                        : "text-gray-700"
                    }`}
                  >
                    {entry.display_name || "Anonymous"}
                    {isCurrentUser && (
                      <span className="text-xs text-gray-400 ml-1.5">
                        (you)
                      </span>
                    )}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-brand-700">
                    {entry.current_streak}
                  </span>
                  {entry.current_streak > 0 && (
                    <span className="ml-1 text-xs">{"\u{1F525}"}</span>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  {entry.longest_streak}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
