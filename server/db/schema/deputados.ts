import * as s from "drizzle-orm/pg-core";

export const deputados = s.pgTable("deputados", {
  id: s.serial().primaryKey(),
  slug: s.text().notNull().unique(),
  id_externo: s.text().notNull().unique(), // ID da API da Câmara
  nome: s.text().notNull(),
  email: s.text(),
  partido: s.text(),
  uf: s.text(),
  avatar_url: s.text(),
  em_exercicio: s.boolean().default(true),
  url_pagina_camara: s.text(),
  created_at: s.timestamp().defaultNow(),
  updated_at: s.timestamp(),
});
