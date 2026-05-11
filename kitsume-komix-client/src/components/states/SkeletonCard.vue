<script setup lang="ts">
import Skeleton from 'primevue/skeleton'

withDefaults(defineProps<{
  width?: string
  height?: string
  count?: number
}>(), {
  width: '100%',
  height: '200px',
  count: 1
})
</script>

<template>
  <div v-for="i in count" :key="i" class="skeleton-card-item">
    <Skeleton :width="width" :height="height" />
  </div>
</template>
