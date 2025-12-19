<script setup lang="ts">
import type { NuxtError } from "#app";

const { error } = defineProps<{
  error: NuxtError;
}>();
</script>

<template>
  <UApp>
    <UError :error="error" />
  </UApp>
</template>
