<script setup lang="ts">
const { data, error } = useFetch(`/api/deputados`, { key: "data" });
</script>

<template>
  <div>
    <h1>{{ data?.success }}</h1>
    <h1>{{ error }}</h1>
    <!-- <img :src="deputy?.avatar_url" alt="Avatar" v-if="deputy?.avatar_url" />

    <h2>Votação Recente:</h2>
    <ul>
      <li v-for="vote in votes" :key="vote.id">
        {{ vote.votation.ementa }} - {{ vote.voto }}
      </li>
    </ul>

    <p>
      Para seguir este parlamentar: @{{ deputy?.handle }}@semfiltro.social.br
    </p> -->
  </div>
</template>
