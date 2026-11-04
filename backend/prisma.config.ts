import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: "backend/.env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL ||
      "postgresql://placeholder:placeholder@localhost:5432/neondb",
  },
});
