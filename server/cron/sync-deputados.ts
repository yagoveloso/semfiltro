import { defineCronHandler } from "#nuxt/cron";

// Executar diariamente às 6h
export default defineCronHandler(
  () => "0 6 * * *",
  async () => {
    console.log("[Cron] ========================================");
    console.log("[Cron] Scheduled sync triggered");
    console.log(`[Cron] Time: ${new Date().toISOString()}`);
    console.log("[Cron] ========================================");

    try {
      const stats = await syncDeputados();
      console.log("[Cron] Sync completed successfully");
      console.log(`[Cron] Stats: ${JSON.stringify(stats)}`);
    } catch (error: unknown) {
      console.error("[Cron] ========================================");
      console.error("[Cron] Sync failed:", error);
      console.error("[Cron] ========================================");
    }
  }
);
