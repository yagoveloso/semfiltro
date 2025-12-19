import type { schema } from "~~/server/db";

// Select types (for reading data)
export type Deputado = typeof schema.deputados.$inferSelect;

// Insert types (for creating data)
export type NovoDeputado = typeof schema.deputados.$inferInsert;
