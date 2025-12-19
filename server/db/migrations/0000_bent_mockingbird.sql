CREATE TABLE "deputados" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"id_externo" text NOT NULL,
	"nome" text NOT NULL,
	"email" text,
	"partido" text,
	"uf" text,
	"avatar_url" text,
	"em_exercicio" boolean DEFAULT true,
	"url_pagina_camara" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "deputados_slug_unique" UNIQUE("slug"),
	CONSTRAINT "deputados_id_externo_unique" UNIQUE("id_externo")
);
