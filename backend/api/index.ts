import type { Request, Response } from "express";
import app from "../src/app.ts";

/**
 * Vercel Serverless Function Handler
 * Normalizes rewrite paths, guards serverless socket attributes,
 * and routes requests smoothly through the Express application.
 */
export default function handler(req: Request, res: Response) {
  // Normalize rewrites if req.url retained Vercel's internal function path
  if (req.url) {
    if (req.url.startsWith("/api/index.ts")) {
      req.url = req.url.replace(/^\/api\/index\.ts/, "") || "/";
    } else if (req.url.startsWith("/api/index")) {
      req.url = req.url.replace(/^\/api\/index/, "") || "/";
    }
  }

  // Defensive fallback for serverless proxies where req.socket or remoteAddress might be missing
  if (!req.socket) {
    (req as unknown as { socket: { remoteAddress: string } }).socket = {
      remoteAddress: (req.headers["x-forwarded-for"] as string) || "127.0.0.1",
    };
  } else if (!req.socket.remoteAddress) {
    (req.socket as unknown as { remoteAddress: string }).remoteAddress =
      (req.headers["x-forwarded-for"] as string) || "127.0.0.1";
  }

  try {
    return app(req, res);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("❌ [Vercel Serverless] Uncaught invocation error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Serverless Function Invocation Error",
        message: error?.message || "Internal server error",
      });
    }
  }
}
