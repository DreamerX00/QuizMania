import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // The main entry for your schema
  schema: "prisma/schema.prisma",

  // Where migrations should be generated
  migrations: {
    path: "prisma/migrations",
  },

  // The database URL
  datasource: {
    url: env("DATABASE_URL"),
    directUrl: env("DIRECT_DATABASE_URL"),
  },
});
