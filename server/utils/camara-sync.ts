import { eq, inArray } from "drizzle-orm";
import { db, schema } from "~~/server/db";
import type { NovoDeputado } from "~~/shared/types/db";

/**
 * Sincroniza deputados da API da Câmara com o banco local
 *
 * Processo:
 * 1. Busca deputados da API (com cache)
 * 2. Busca deputados do banco
 * 3. Identifica novos, atualizados e inativos
 * 4. Executa operações no banco (batch)
 * 5. Atualiza cache e metadata
 * 6. Retorna estatísticas
 */
export async function syncDeputados(): Promise<DeputadoSyncStats> {
  const startTime = Date.now();
  const stats: DeputadoSyncStats = {
    inserted: 0,
    updated: 0,
    deactivated: 0,
    unchanged: 0,
    errors: [],
    duration: 0,
  };

  console.log("[Sync] ========================================");
  console.log("[Sync] Iniciando sincronização de deputados...");
  console.log("[Sync] ========================================");

  const deputadosApi = await fetchDeputadosEmExercicio();
  if (!deputadosApi) {
    throw new Error("[Sync] Não foi possível obter os deputados da API");
  }
  console.log(`[Sync] Total de deputados na API: ${deputadosApi.length}`);

  // 2. Buscar deputados do banco
  const deputadosDb = await db.select().from(schema.deputados);
  console.log(`[Sync] Total de deputados no banco: ${deputadosDb.length}`);

  // 3. Criar mapeamento de IDs externos
  const apiIds = new Set(deputadosApi?.map((d) => d.id.toString()));
  const dbMap = new Map(deputadosDb.map((d) => [d.id_externo, d]));

  // Obter todos os slugs existentes para verificação de unicidade
  const existingSlugs = deputadosDb.map((d) => d.slug);

  // 4. Identificar operações necessárias
  const toInsert: NovoDeputado[] = [];
  const toUpdate: Array<{
    id: number;
    data: Omit<NovoDeputado, "id_externo" | "slug">;
  }> = [];
  const toDeactivate: number[] = [];

  // Processar deputados da API
  for (const apiDeputado of deputadosApi) {
    const idExterno = apiDeputado.id.toString();
    const existingDeputado = dbMap.get(idExterno);

    if (!existingDeputado) {
      // NOVO DEPUTADO - precisa inserir
      const slug = generateUniqueSlug(apiDeputado.nome, existingSlugs);
      existingSlugs.push(slug); // Adicionar à lista para evitar conflitos

      toInsert.push({
        id_externo: idExterno,
        nome: apiDeputado.nome,
        partido: apiDeputado.siglaPartido,
        uf: apiDeputado.siglaUf,
        avatar_url: apiDeputado.urlFoto,
        email: apiDeputado.email || null,
        url_pagina_camara: apiDeputado.uri,
        slug,
        em_exercicio: true,
        updated_at: new Date(),
      });

      console.log(
        `[Sync] Novo deputado: ${apiDeputado.nome} (${idExterno}) -> slug: ${slug}`
      );
    } else {
      // DEPUTADO EXISTENTE - verificar se precisa atualizar
      const needsUpdate =
        existingDeputado.nome !== apiDeputado.nome ||
        existingDeputado.partido !== apiDeputado.siglaPartido ||
        existingDeputado.uf !== apiDeputado.siglaUf ||
        existingDeputado.avatar_url !== apiDeputado.urlFoto ||
        existingDeputado.email !== (apiDeputado.email || null) ||
        !existingDeputado.em_exercicio; // Reativar se estava inativo

      if (needsUpdate) {
        toUpdate.push({
          id: existingDeputado.id,
          data: {
            nome: apiDeputado.nome,
            partido: apiDeputado.siglaPartido,
            uf: apiDeputado.siglaUf,
            avatar_url: apiDeputado.urlFoto,
            email: apiDeputado.email || null,
            url_pagina_camara: apiDeputado.uri,
            em_exercicio: true,
            updated_at: new Date(),
          },
        });

        console.log(
          `[Sync] Atualizar deputado: ${apiDeputado.nome} (${idExterno})`
        );
      } else {
        stats.unchanged++;
      }
    }
  }

  // Identificar deputados inativos (não estão mais na API)
  for (const dbDeputado of deputadosDb) {
    if (!apiIds.has(dbDeputado.id_externo) && dbDeputado.em_exercicio) {
      toDeactivate.push(dbDeputado.id);
      console.log(
        `[Sync] Desativar deputado: ${dbDeputado.nome} (${dbDeputado.id_externo})`
      );
    }
  }

  // 5. Executar operações no banco
  console.log("[Sync] Executando operações no banco...");

  // Inserir novos deputados
  if (toInsert.length > 0) {
    await db.insert(schema.deputados).values(toInsert);
    stats.inserted = toInsert.length;
    console.log(`[Sync] ${stats.inserted} deputados inseridos`);
  }

  // Atualizar deputados existentes
  for (const { id, data } of toUpdate) {
    await db
      .update(schema.deputados)
      .set(data)
      .where(eq(schema.deputados.id, id));
  }
  stats.updated = toUpdate.length;
  if (stats.updated > 0) {
    console.log(`[Sync] ${stats.updated} deputados atualizados`);
  }

  // Desativar deputados inativos
  if (toDeactivate.length > 0) {
    await db
      .update(schema.deputados)
      .set({ em_exercicio: false, updated_at: new Date() })
      .where(inArray(schema.deputados.id, toDeactivate));
    stats.deactivated = toDeactivate.length;
    console.log(`[Sync] ${stats.deactivated} deputados desativados`);
  }

  // 6. Invalidar cache se houve mudanças
  if (stats.inserted > 0 || stats.updated > 0 || stats.deactivated > 0) {
    await useStorage("cache").removeItem(
      "nitro:functions:fetchDeputadosEmExercicio:default.json"
    );
    console.log("[Sync] Cache invalidado");
  }

  // 7. metadata
  console.table({
    last_sync: new Date().toISOString(),
    next_sync: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +24h
    total_deputados: deputadosApi.length,
    em_exercicio: deputadosApi.length,
  });

  stats.duration = Date.now() - startTime;

  console.log("[Sync] ========================================");
  console.log("[Sync] Sincronização concluída!");
  console.log(`[Sync] Inseridos: ${stats.inserted}`);
  console.log(`[Sync] Atualizados: ${stats.updated}`);
  console.log(`[Sync] Desativados: ${stats.deactivated}`);
  console.log(`[Sync] Sem mudanças: ${stats.unchanged}`);
  console.log(`[Sync] Duração: ${stats.duration}ms`);
  console.log("[Sync] ========================================");

  return stats;
}
