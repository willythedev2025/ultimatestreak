import type {
  KalshiEventsResponse,
  KalshiMarketsResponse,
  KalshiMarket,
} from "../types/kalshi";
import crypto from "crypto";

export class KalshiClient {
  private baseUrl: string;
  private apiKey: string;
  private privateKey: string;

  constructor(baseUrl: string, apiKey: string, privateKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.privateKey = privateKey;
  }

  private sign(timestampStr: string, method: string, path: string): string {
    const message = `${timestampStr}\n${method}\n${path}`;
    const signature = crypto.sign("sha256", Buffer.from(message), {
      key: this.privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    });
    return signature.toString("base64");
  }

  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    // Kalshi signs against the path + query string portion
    const signPath = `/trade-api/v2${path}`;
    const signature = this.sign(timestamp, "GET", signPath);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "KALSHI-ACCESS-KEY": this.apiKey,
        "KALSHI-ACCESS-SIGNATURE": signature,
        "KALSHI-ACCESS-TIMESTAMP": timestamp,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Kalshi API error: ${res.status} ${res.statusText} - ${body}`);
    }

    return res.json() as Promise<T>;
  }

  async getEvents(params?: {
    cursor?: string;
    limit?: number;
    status?: string;
    category?: string;
  }): Promise<KalshiEventsResponse> {
    const query: Record<string, string> = {};
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = String(params.limit);
    if (params?.status) query.status = params.status;
    if (params?.category) query.category = params.category;

    return this.request<KalshiEventsResponse>("/events", query);
  }

  async getMarkets(params?: {
    cursor?: string;
    limit?: number;
    event_ticker?: string;
    status?: string;
    min_close_ts?: number;
    max_close_ts?: number;
  }): Promise<KalshiMarketsResponse> {
    const query: Record<string, string> = {};
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = String(params.limit);
    if (params?.event_ticker) query.event_ticker = params.event_ticker;
    if (params?.status) query.status = params.status;
    if (params?.min_close_ts) query.min_close_ts = String(params.min_close_ts);
    if (params?.max_close_ts) query.max_close_ts = String(params.max_close_ts);

    return this.request<KalshiMarketsResponse>("/markets", query);
  }

  async getMarket(ticker: string): Promise<KalshiMarket> {
    const res = await this.request<{ market: KalshiMarket }>(`/markets/${ticker}`);
    return res.market;
  }
}
