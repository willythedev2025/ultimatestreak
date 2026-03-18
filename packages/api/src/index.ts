import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import express from "express";
import cors from "cors";
import { contestRoutes } from "./routes/contests";
import { pickRoutes } from "./routes/picks";
import { marketRoutes } from "./routes/markets";
import { paymentRoutes } from "./routes/payments";
import { leaderboardRoutes } from "./routes/leaderboard";
import { authMiddleware } from "./middleware/auth";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ultimate-streak-api" });
});

app.use("/api/markets", marketRoutes); // public - browse markets
app.use("/api/contests", authMiddleware, contestRoutes);
app.use("/api/picks", authMiddleware, pickRoutes);
app.use("/api/payments", paymentRoutes); // has its own auth handling for webhooks
app.use("/api/leaderboard", leaderboardRoutes);

app.listen(port, () => {
  console.log(`Ultimate Streak API running on port ${port}`);
});
