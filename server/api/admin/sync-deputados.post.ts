export default eventHandler(async (event) => {
  // 1. Verificar autenticação via header secret
  const secretHeader = getHeader(event, "x-sync-secret");
  const syncSecret = process.env.NUXT_SYNC_SECRET;

  if (secretHeader !== syncSecret) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: Invalid sync secret",
    });
  }

  console.log("[API] Manual sync triggered");

  try {
    // 2. Executar sincronização
    const stats = await syncDeputados();

    // 3. Retornar resultado
    return {
      success: true,
      message: "Sincronização concluída com sucesso",
      timestamp: new Date().toISOString(),
      stats,
    };
  } catch (error: unknown) {
    console.error("[API] Sync failed:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Sync failed",
      data: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
});
