import type { Config } from "drizzle-kit";

export default {
  schema: "./server/db/schema/*.ts",
  out: "./server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NUXT_DATABASE_URL!,
  },
} satisfies Config;
