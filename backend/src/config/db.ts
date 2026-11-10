import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";
import { env } from "./env.ts";

// Neon serverless driver requires `ws` in Node.js runtime for reliable WebSocket transport
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({
  connectionString: env.DATABASE_URL,
});

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
