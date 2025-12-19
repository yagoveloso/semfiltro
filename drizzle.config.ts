import type { Config } from "drizzle-kit";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://semfiltro:semfiltro@localhost:5432/semfiltro";

export default {
  schema: "./server/db/schema/*.ts",
  out: "./server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
} satisfies Config;
