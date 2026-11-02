import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { env } from "./env.ts";

// Use native WebSocket in Bun / Node.js if available
if (typeof globalThis.WebSocket !== "undefined") {
  neonConfig.webSocketConstructor = globalThis.WebSocket;
}

const connectionString =
  env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/neondb";

const adapter = new PrismaNeon({ connectionString });

// Global declaration to prevent multiple instances in dev mode
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.PRISMA_LOG_QUERY === "true"
        ? ["query", "error", "warn"]
        : ["error", "warn"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
