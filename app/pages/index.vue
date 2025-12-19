<template>
  <UContainer>
    <UPageHero
      title="Transparência sem filtros. Democracia sem manipulação"
      description="Acompanhe seus parlamentares de interesse no Fediverso, sem manipulação de algoritmos. Receba exatamente como eles votaram, direto da fonte oficial, explicado em linguagem simples."
    >
      <template #headline>
        <div class="flex justify-center">
          <AppLogo />
        </div>
      </template>

      <template #body>
        <UPageGrid class="text-left">
          <UPageFeature
            icon="i-lucide-check"
            title="Dados oficiais direto da Câmara dos Deputados"
          />
          <UPageFeature
            icon="i-lucide-check"
            title="Funciona em qualquer app do Fediverso (Mastodon, Pleroma, etc.)"
          />
          <UPageFeature
            icon="i-lucide-check"
            title="Código aberto e transparente"
          />
        </UPageGrid>
      </template>

      <template #footer>
        <div class="flex justify-center">
          <UPageCTA
            title="Em breve você poderá acompanhar seus parlamentares aqui!"
            variant="subtle"
            class="max-w-lg"
            :ui="{
              container: 'py-6 sm:py-10 lg:py-12',
            }"
          />
        </div>
      </template>
    </UPageHero>
  </UContainer>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "em-breve",
});
</script>
