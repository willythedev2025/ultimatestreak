"use client";

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
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getProbabilityColor(pct: number) {
  if (pct >= 70) return "text-green-400";
  if (pct >= 40) return "text-yellow-400";
  return "text-red-400";
}

export function MarketCard({ market }: { market: Market }) {
  const yesPct = market.last_price;
  const noPct = 100 - yesPct;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg leading-tight mb-1">{market.title}</h3>
          {market.subtitle && (
            <p className="text-sm text-gray-400">{market.subtitle}</p>
          )}
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap mt-1">
          Closes {formatTime(market.close_time)}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 bg-gray-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-green-500 h-full rounded-full transition-all"
            style={{ width: `${yesPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-gray-500">Yes </span>
            <span className={`font-semibold ${getProbabilityColor(yesPct)}`}>
              {yesPct}%
            </span>
          </div>
          <div>
            <span className="text-gray-500">No </span>
            <span className={`font-semibold ${getProbabilityColor(noPct)}`}>
              {noPct}%
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
            Pick Yes
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
            Pick No
          </button>
        </div>
      </div>

      <div className="mt-3 flex gap-4 text-xs text-gray-600">
        <span>Vol: {market.volume.toLocaleString()}</span>
        <span>{market.ticker}</span>
      </div>
    </div>
  );
}
