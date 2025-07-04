import "dotenv/config";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });
config({ path: ".env.development" });
config({ path: ".env.local" });

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
  dialect: process.env.DATABASE_URL ? "postgresql" : "sqlite",
  dbCredentials: process.env.DATABASE_URL ? {
    url: process.env.DATABASE_URL!,
  } : {
    url: "./src/db/local.db",
  },
});
