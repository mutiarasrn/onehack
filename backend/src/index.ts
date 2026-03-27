import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PORT } from "./config";
import listingsRouter from "./routes/listings";
import leaguesRouter from "./routes/leagues";
import scoresRouter from "./routes/scores";
import leaderboardRouter from "./routes/leaderboard";
import { startAutoResolver } from "./autoResolver";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount routes under /api
app.use("/api", listingsRouter);
app.use("/api", leaguesRouter);
app.use("/api", scoresRouter);
app.use("/api", leaderboardRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[global error]", err);
  res.status(500).json({ error: err.message ?? "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`OneChain Fantasy backend listening on port ${PORT}`);
  startAutoResolver();
});

export default app;
