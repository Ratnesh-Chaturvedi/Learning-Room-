import express, { type Application, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env.ts";
import v1Routes from "./routes/v1/index.ts";
import { ApiError } from "./utils/apiError.ts";

const app: Application = express();

// Trust reverse proxies (essential for Vercel, Render, Cloudflare, load balancers)
app.set("trust proxy", true);

// Global Middlewares
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);
      const allowedOrigins = [
        env.CLIENT_URL,
        "http://localhost:3000",
        "http://localhost:5173",
      ].filter(Boolean);

      if (
        allowedOrigins.includes(requestOrigin) ||
        requestOrigin.endsWith(".vercel.app") ||
        requestOrigin.includes("localhost") ||
        requestOrigin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }
      return callback(null, requestOrigin);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (env.NODE_ENV === "development" && !process.env.VERCEL) {
  app.use(morgan("dev"));
}

// Health Check Endpoints (Handles /, /health, /api, /api/health)
const sendHealthCheck = (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    success: true,
    message: "Learning Room API Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: {
      nodeEnv: env.NODE_ENV,
      databaseConfigured: Boolean(env.DATABASE_URL),
      googleAuthConfigured: Boolean(env.GOOGLE_CLIENT_ID),
    },
  });
};

app.get("/", sendHealthCheck);
app.get("/health", sendHealthCheck);
app.get("/api", sendHealthCheck);
app.get("/api/health", sendHealthCheck);
app.get("/ping", (_req: Request, res: Response) => {
  res.status(200).send("pong");
});

// API Routes
app.use("/api/v1", v1Routes);

// Centralized 404 Route Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
  });
});

export default app;
