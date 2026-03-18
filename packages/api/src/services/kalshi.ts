import { KalshiClient } from "@ultimate-streak/shared";

const baseUrl = process.env.KALSHI_API_BASE_URL!;
const apiKey = process.env.KALSHI_API_KEY!;
const privateKey = process.env.KALSHI_API_SECRET!;

export const kalshiClient = new KalshiClient(baseUrl, apiKey, privateKey);
