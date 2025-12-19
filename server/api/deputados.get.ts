import { eq, and } from "drizzle-orm";
import { db, schema } from "~~/server/db";

export default eventHandler(async (event) => {
  const query = getQuery(event);

  // Extrair filtros da query string
  const {
    partido,
    uf,
    em_exercicio = "true", // Por padrão, apenas ativos
    limit = "100",
    offset = "0",
  } = query;

  try {
    // Construir condições de filtro
    const conditions = [];

    // Filtro: apenas em exercício (padrão)
    if (em_exercicio === "true") {
      conditions.push(eq(schema.deputados.em_exercicio, true));
    }

    // Filtro: partido específico
    if (partido && typeof partido === "string") {
      conditions.push(eq(schema.deputados.partido, partido.toUpperCase()));
    }

    // Filtro: UF específico
    if (uf && typeof uf === "string") {
      conditions.push(eq(schema.deputados.uf, uf.toUpperCase()));
    }

    // Aplicar paginação
    const limitNum = parseInt(limit as string) || 100;
    const offsetNum = parseInt(offset as string) || 0;

    // Executar query com filtros e paginação
    const deputados =
      conditions.length > 0
        ? await db
            .select()
            .from(schema.deputados)
            .where(and(...conditions))
            .limit(Math.min(limitNum, 1000))
            .offset(offsetNum)
        : await db
            .select()
            .from(schema.deputados)
            .limit(Math.min(limitNum, 1000))
            .offset(offsetNum);

    // Retornar resposta
    return {
      success: true,
      data: deputados,
      meta: {
        count: deputados.length,
        limit: limitNum,
        offset: offsetNum,
        filters: {
          partido: partido || null,
          uf: uf || null,
          em_exercicio: em_exercicio === "true",
        },
      },
    };
  } catch (error: unknown) {
    console.error("[API] Error fetching deputados:", error);

    return {
      success: false,
      error: "Failed to fetch deputados",
      message: error instanceof Error ? error.message : String(error),
    };
  }
});
