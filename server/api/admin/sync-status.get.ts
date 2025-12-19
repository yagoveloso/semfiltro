import { eq, sql } from "drizzle-orm";
import { db, schema } from "~~/server/db";

export default eventHandler(async () => {
  try {
    // Estatísticas do banco
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.deputados);

    const [ativosResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.deputados)
      .where(eq(schema.deputados.em_exercicio, true));

    return {
      success: true,
      database: {
        total: totalResult?.count ?? 0,
        em_exercicio: ativosResult?.count ?? 0,
        inativos: (totalResult?.count ?? 0) - (ativosResult?.count ?? 0),
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    console.error("[API] Error fetching sync status:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});
