import path from "node:path";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Discover .env from backend directory or current directory safely
try {
  let baseDir = process.cwd();
  if (typeof import.meta !== "undefined" && typeof (import.meta as { dirname?: string }).dirname === "string") {
    baseDir = (import.meta as { dirname?: string }).dirname!;
  }
  dotenv.config({ path: path.resolve(baseDir, ".env") });
} catch {
  // Gracefully fallback
}
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL ||
      "postgresql://placeholder:placeholder@localhost:5432/neondb",
  },
});
