import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import { z } from "zod";

// 1. Multi-Environment Discovery (Works from root, backend/, Docker, or CI/CD)
const candidatePaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "backend/.env"),
  path.resolve(import.meta.dirname, "../../.env"),
];

for (const envPath of candidatePaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

// 2. Resilient Schema Definition with Safe Fallbacks for Serverless Deployments
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CLIENT_URL: z.string().default("http://localhost:3000"),

  // Database (PostgreSQL / Neon)
  DATABASE_URL: z.string().default(""),
  DIRECT_URL: z.string().optional(),

  // JWT / Security
  JWT_SECRET: z.string().default("learning-room-jwt-secret-production-fallback"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  REFRESH_TOKEN_SECRET: z.string().default("learning-room-refresh-token-production-fallback"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("30d"),

  // Google OAuth 2.0
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_CALLBACK_URL: z
    .string()
    .default("http://localhost:5000/api/v1/auth/google/callback"),
});

// 3. Non-Crashing Safe Parsing
const parsed = envSchema.safeParse(process.env);

export const envConfigErrors: string[] = [];

if (!parsed.success) {
  for (const issue of parsed.error.issues) {
    envConfigErrors.push(`[${issue.path.join(".")}]: ${issue.message}`);
  }
  console.warn("⚠️ [Config Warning] Environment issues detected:\n" + envConfigErrors.join("\n"));
} else {
  // Check for critical missing variables without crashing serverless health checks
  if (!parsed.data.DATABASE_URL) {
    envConfigErrors.push("DATABASE_URL is not set in environment variables");
  }
  if (!parsed.data.GOOGLE_CLIENT_ID) {
    envConfigErrors.push("GOOGLE_CLIENT_ID is not set in environment variables");
  }
  if (envConfigErrors.length > 0) {
    console.warn("⚠️ [Notice] Running with missing optional/cloud credentials:\n" + envConfigErrors.join("\n"));
  }
}

// 4. Inferred Type & Immutable Object Export
export type Env = z.infer<typeof envSchema>;
export const env: Readonly<Env> = Object.freeze(
  parsed.success ? parsed.data : envSchema.parse({})
);

export default env;
