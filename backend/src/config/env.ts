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

// 2. Strict Schema Definition (Industry Standard validation)
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL").default("http://localhost:5173"),

  // Database (PostgreSQL / Neon) - Mandatory
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required in .env"),
  DIRECT_URL: z.string().min(1).optional(),

  // JWT / Security - Mandatory
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required in .env"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required in .env"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("30d"),

  // Google OAuth 2.0
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required in .env"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required in .env"),
  GOOGLE_CALLBACK_URL: z
    .string()
    .url("GOOGLE_CALLBACK_URL must be a valid URL")
    .default("http://localhost:5000/api/v1/auth/google/callback"),
});

// 3. Fail-Fast Validation
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formattedErrors = parsed.error.issues
    .map((issue) => `  ✖ [${issue.path.join(".")}]: ${issue.message}`)
    .join("\n");

  console.error("\n❌ [FATAL] Environment Configuration Error:");
  console.error(formattedErrors);
  console.error("\nMake sure your .env file exists and contains all required variables.\n");
  process.exit(1);
}

// 4. Inferred Type & Immutable Object Export
export type Env = z.infer<typeof envSchema>;
export const env: Readonly<Env> = Object.freeze(parsed.data);

export default env;
