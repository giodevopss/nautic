import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./db";
import vehiclesRouter from "./routes/vehicles";
import reservationsRouter from "./routes/reservations";
import adminRouter from "./routes/admin";
import authRouter from "./routes/auth";

const app = express();
const PORT = Number(process.env.PORT || process.env.API_PORT) || 3001;

app.use(
  cors({
    origin: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86_400,
  }),
);
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$connect();
    res.json({ status: "ok", database: "connected", timestamp: new Date() });
  } catch {
    res
      .status(500)
      .json({ status: "error", database: "disconnected", timestamp: new Date() });
  }
});

app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/reservations", reservationsRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server listening on port ${PORT}`);
});
