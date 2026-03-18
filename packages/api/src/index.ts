import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Dynamic imports to ensure env vars are loaded before modules that use them
async function main() {
  const express = (await import("express")).default;
  const cors = (await import("cors")).default;
  const { contestRoutes } = await import("./routes/contests");
  const { pickRoutes } = await import("./routes/picks");
  const { marketRoutes } = await import("./routes/markets");
  const { paymentRoutes } = await import("./routes/payments");
  const { leaderboardRoutes } = await import("./routes/leaderboard");
  const { adminRoutes } = await import("./routes/admin");
  const { authMiddleware } = await import("./middleware/auth");

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
  app.use("/api/admin", adminRoutes);

  app.listen(port, () => {
    console.log(`Ultimate Streak API running on port ${port}`);
  });
}

main();
