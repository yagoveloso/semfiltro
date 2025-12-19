/**
 * Manual Sync Trigger Endpoint
 *
 * Este endpoint permite trigger manual da sincronização de deputados
 * Protegido por secret header
 *
 * O cron automático roda via node-cron (ver server/plugins/cron.ts)
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const secretHeader = getHeader(event, "x-sync-secret");
  const expectedSecret = config.syncSecret;

  if (secretHeader !== expectedSecret) {
    throw createError({
      statusCode: 403,
      statusMessage: "Unauthorized: Invalid sync secret",
    });
  }

  console.log("[Manual Sync] ========================================");
  console.log("[Manual Sync] Triggered via HTTP");
  console.log(`[Manual Sync] Time: ${new Date().toISOString()}`);
  console.log("[Manual Sync] ========================================");

  try {
    const stats = await syncDeputados();

    console.log("[Manual Sync] Sync completed successfully");
    console.log(`[Manual Sync] Stats: ${JSON.stringify(stats)}`);

    return {
      success: true,
      trigger: "manual",
      timestamp: new Date().toISOString(),
      stats,
    };
  } catch (error: unknown) {
    console.error("[Manual Sync] ========================================");
    console.error("[Manual Sync] Sync failed:", error);
    console.error("[Manual Sync] ========================================");

    return {
      success: false,
      trigger: "manual",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
});
