import cors from "cors";
import express, { Express } from "express";
import { nowPaymentsRouter } from "./services/nowpayments/routes";
import { pulsechainRouter } from "./services/pulsechain/routes";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/payments/nowpayments", nowPaymentsRouter);
  app.use("/api/payments/pulsechain", pulsechainRouter);

  return app;
}
