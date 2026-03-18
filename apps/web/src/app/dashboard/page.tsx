"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authApiFetch } from "@/lib/api";

interface Contest {
  id: string;
  month: number;
  year: number;
  entry_fee_cents: number;
  prize_pool_cents: number;
  status: "upcoming" | "active" | "settling" | "completed";
}

interface ContestEntry {
  id: string;
  contest_id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
}

interface Pick {
  id: string;
  user_id: string;
  contest_entry_id: string;
  event_title: string;
  market_title: string;
  predicted_outcome: "yes" | "no";
  status: "active" | "settled";
  result: "correct" | "incorrect" | null;
  picked_at: string;
  settled_at: string | null;
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

export default function DashboardPage() {
  const { user, session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [contest, setContest] = useState<Contest | null>(null);
  const [entry, setEntry] = useState<ContestEntry | null>(null);
  const [activePick, setActivePick] = useState<Pick | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningContest, setJoiningContest] = useState(false);
  const [hasNoEntry, setHasNoEntry] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!session?.access_token) return;

    async function loadDashboard() {
      const token = session!.access_token;
      try {
        const c = await authApiFetch<Contest>(
          "/api/contests/current",
          token
        );
        setContest(c);

        try {
          const e = await authApiFetch<ContestEntry>(
            `/api/contests/${c.id}/entry`,
            token
          );
          setEntry(e);
        } catch {
          setHasNoEntry(true);
        }

        try {
          const { pick } = await authApiFetch<{ pick: Pick | null }>(
            "/api/picks/active",
            token
          );
          setActivePick(pick);
        } catch {
          // No active pick
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      } finally {
        setLoadingData(false);
      }
    }

    loadDashboard();
  }, [session]);

  async function handleJoinContest() {
    if (!session?.access_token || !contest) return;
    setJoiningContest(true);
    try {
      const entryData = await authApiFetch<ContestEntry>(
        `/api/contests/${contest.id}/join-free`,
        session.access_token,
        { method: "POST" }
      );
      setEntry(entryData);
      setHasNoEntry(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to join contest"
      );
    } finally {
      setJoiningContest(false);
    }
  }

  if (authLoading || (!user && !error)) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-[80vh] px-4 py-8 max-w-5xl mx-auto">
      <h1 className="section-title mb-6">Dashboard</h1>

      {error && (
        <div className="card border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loadingData ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Contest Info */}
          {contest && (
            <div className="card p-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
                    Current Contest
                  </p>
                  <h2 className="text-xl font-bold text-gray-900">
                    {MONTH_NAMES[contest.month]} {contest.year}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
                    Prize Pool
                  </p>
                  <p className="text-3xl font-black text-brand-600">
                    {formatCents(contest.prize_pool_cents)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No Entry - Join */}
          {hasNoEntry && contest && (
            <div className="card p-10 text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Ready to compete?
              </h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Join for free and start picking prediction market outcomes to
                build your streak.
              </p>
              <button
                onClick={handleJoinContest}
                disabled={joiningContest}
                className="btn-primary text-lg px-10 py-3"
              >
                {joiningContest ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Joining...
                  </span>
                ) : (
                  "Join Contest \u2014 Free"
                )}
              </button>
            </div>
          )}

          {/* Stats */}
          {entry && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="card p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">
                  Current Streak
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-brand-600">
                    {entry.current_streak}
                  </span>
                  {entry.current_streak > 0 && (
                    <span className="text-2xl">
                      {"\u{1F525}".repeat(Math.min(entry.current_streak, 5))}
                    </span>
                  )}
                </div>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">
                  Longest Streak
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">
                    {entry.longest_streak}
                  </span>
                  <span className="text-xs text-gray-400">personal best</span>
                </div>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">
                  Status
                </p>
                {activePick ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-sm font-medium text-amber-600">
                      Pick pending
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                    <span className="text-sm font-medium text-brand-700">
                      Ready to pick
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Pick */}
          {activePick && (
            <div className="card border-amber-200 p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Active Pick
                </p>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {activePick.event_title}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {activePick.market_title}
              </p>
              <div className="flex items-center gap-3">
                <span
                  className={`pill ${
                    activePick.predicted_outcome === "yes"
                      ? "pill-yes"
                      : "pill-no"
                  }`}
                >
                  Picked {activePick.predicted_outcome.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(activePick.picked_at).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          {entry && (
            <div className="flex flex-wrap gap-3">
              <Link
                href="/pick"
                className={
                  activePick
                    ? "btn-secondary opacity-50 cursor-not-allowed pointer-events-none"
                    : "btn-primary"
                }
              >
                {activePick ? "Pick Pending..." : "Make a Pick"}
              </Link>
              <Link href="/leaderboard" className="btn-secondary">
                View Leaderboard
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}
