import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables (.env in backend or project root)
dotenv.config();
dotenv.config({ path: "backend/.env" });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CLIENT_URL: z.string().default("http://localhost:3000"),

  // Database (PostgreSQL / Neon)
  DATABASE_URL: z.string().default(""),
  DIRECT_URL: z.string().optional(),

  // JWT / Authentication
  JWT_SECRET: z.string().default("learning-room-jwt-secret"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  REFRESH_TOKEN_SECRET: z.string().default("learning-room-refresh-token-secret"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("30d"),

  // Google OAuth 2.0
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_CALLBACK_URL: z
    .string()
    .default("http://localhost:5000/api/v1/auth/google/callback"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ [Config Error] Invalid environment configuration:", parsed.error.format());
}

export type Env = z.infer<typeof envSchema>;
export const env: Readonly<Env> = Object.freeze(
  parsed.success ? parsed.data : envSchema.parse({})
);

export default env;
