import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // The main entry for your schema
  schema: "prisma/schema.prisma",

  // Where migrations should be generated
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed-ai-providers.ts",
  },

  // The database URL - for Accelerate users, this can be the Accelerate URL
  // For migrations with Accelerate, use DIRECT_DATABASE_URL
  datasource: {
    // Use DIRECT_DATABASE_URL for migrations if available, otherwise DATABASE_URL
    url: env("DIRECT_DATABASE_URL") || env("DATABASE_URL"),
  },
});
