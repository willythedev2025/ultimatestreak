"use client";

import { useState } from "react";

interface Market {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle: string;
  yes_bid: number;
  yes_ask: number;
  last_price: number;
  volume: number;
  close_time: string;
  category: string;
}

interface MarketCardProps {
  market: Market;
  onPick?: (ticker: string, outcome: "yes" | "no") => Promise<void>;
  disabled?: boolean;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function OddsPill({ pct, variant }: { pct: number; variant: "yes" | "no" }) {
  const isYes = variant === "yes";
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[3.5rem] px-3 py-1.5 rounded-full text-sm font-bold border ${
        isYes
          ? "bg-brand-50 text-brand-700 border-brand-200"
          : "bg-red-50 text-red-700 border-red-200"
      }`}
    >
      {pct}%
    </span>
  );
}

export function MarketCard({ market, onPick, disabled }: MarketCardProps) {
  const yesPct = market.last_price;
  const noPct = 100 - yesPct;

  const [confirming, setConfirming] = useState<"yes" | "no" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!confirming || !onPick) return;
    setSubmitting(true);
    try {
      await onPick(market.ticker, confirming);
    } catch {
      setSubmitting(false);
      setConfirming(null);
    }
  }

  return (
    <div className="card card-hover p-5 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[15px] leading-snug text-gray-800 group-hover:text-gray-900 transition line-clamp-2">
            {market.subtitle || market.title}
          </h3>
          {market.subtitle && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              {market.title}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap mt-0.5 shrink-0">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {formatTime(market.close_time)}
        </div>
      </div>

      {/* Probability bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500"
            style={{ width: `${yesPct}%` }}
          />
        </div>
      </div>

      {/* Odds + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium">Yes</span>
            <OddsPill pct={yesPct} variant="yes" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium">No</span>
            <OddsPill pct={noPct} variant="no" />
          </div>
        </div>

        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Pick{" "}
              <span
                className={
                  confirming === "yes"
                    ? "text-brand-700 font-bold"
                    : "text-red-600 font-bold"
                }
              >
                {confirming.toUpperCase()}
              </span>
              ?
            </span>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="btn-primary text-xs px-3 py-1.5"
            >
              {submitting ? (
                <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Confirm"
              )}
            </button>
            <button
              onClick={() => setConfirming(null)}
              disabled={submitting}
              className="text-gray-400 hover:text-gray-700 text-xs px-2 py-1.5 transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => onPick && setConfirming("yes")}
              disabled={disabled || !onPick}
              className="bg-brand-50 hover:bg-brand-100 border border-brand-200 hover:border-brand-300 disabled:opacity-30 disabled:cursor-not-allowed text-brand-700 text-sm font-semibold px-4 py-2 rounded-lg transition-all"
            >
              Yes
            </button>
            <button
              onClick={() => onPick && setConfirming("no")}
              disabled={disabled || !onPick}
              className="bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 disabled:opacity-30 disabled:cursor-not-allowed text-red-600 text-sm font-semibold px-4 py-2 rounded-lg transition-all"
            >
              No
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
        <span className="pill-neutral text-[11px] px-2 py-0.5 rounded-md">
          {market.category}
        </span>
        <span>Vol {market.volume.toLocaleString()}</span>
        <span className="font-mono text-gray-300">{market.ticker}</span>
      </div>
    </div>
  );
}
