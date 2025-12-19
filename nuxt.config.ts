// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxt/ui", "nuxt-cron"],

  css: ["~/assets/css/main.css"],

  fonts: {
    priority: ["bunny", "google"],
  },

  cron: {
    timeZone: "America/Sao_Paulo",
  },

  nitro: {
    storage: {
      redis: {
        driver: "redis",
        url: process.env.NUXT_REDIS_URL,
      },
    },
    devStorage: {
      cache: {
        driver: "redis",
        url: process.env.NUXT_REDIS_URL,
      },
    },
  },

  runtimeConfig: {
    baseUrl: {
      camara: "https://dadosabertos.camara.leg.br/api/v2",
    },
  },
});
