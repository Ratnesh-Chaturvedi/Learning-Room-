import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon, PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { env } from "./env.ts";

const connectionString =
  env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/neondb";

// Detect Vercel or AWS Lambda serverless execution
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.VERCEL_ENV
);

function createPrismaClient(): PrismaClient {
  try {
    let adapter;
    if (isServerless) {
      // In Vercel serverless functions, HTTP queries avoid persistent WebSocket timeouts
      adapter = new PrismaNeonHttp(connectionString, {});
    } else {
      if (typeof globalThis.WebSocket !== "undefined") {
        neonConfig.webSocketConstructor = globalThis.WebSocket;
      }
      adapter = new PrismaNeon({ connectionString });
    }

    return new PrismaClient({
      adapter,
      log:
        process.env.PRISMA_LOG_QUERY === "true"
          ? ["query", "error", "warn"]
          : ["error", "warn"],
    });
  } catch (error) {
    console.error("⚠️ [Prisma Warning] Failed to initialize Prisma adapter:", error);
    return new PrismaClient();
  }
}

// Global declaration to prevent multiple instances across hot reloads / invocations
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
