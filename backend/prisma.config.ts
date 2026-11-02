import path from "node:path";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Discover .env from backend directory or current directory
dotenv.config({ path: path.resolve(import.meta.dirname, ".env") });
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
