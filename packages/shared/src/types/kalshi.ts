export interface KalshiEvent {
  event_ticker: string;
  title: string;
  category: string;
  sub_title: string;
  mutually_exclusive: boolean;
  markets: KalshiMarket[];
}

export interface KalshiMarket {
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
  status: "open" | "closed" | "settled";
  result: "yes" | "no" | null;
  close_time: string;
  expiration_time: string;
}

export interface KalshiEventsResponse {
  events: KalshiEvent[];
  cursor: string | null;
}

export interface KalshiMarketsResponse {
  markets: KalshiMarket[];
  cursor: string | null;
}
