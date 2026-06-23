<script setup lang="ts">
defineProps<{
  width?: string
  height?: string
}>()
</script>

<template>
  <div class="rounded animate-pulse bg-surface-overlay" :style="{ width, height }" />
</template>
