export interface Pick {
  id: string;
  user_id: string;
  contest_entry_id: string;
  kalshi_event_ticker: string;
  kalshi_market_ticker: string;
  event_title: string;
  market_title: string;
  predicted_outcome: "yes" | "no";
  status: PickStatus;
  result: PickResult | null;
  picked_at: string;
  settled_at: string | null;
}

export type PickStatus = "active" | "settled";
export type PickResult = "correct" | "incorrect";
