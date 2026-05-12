<script setup lang="ts">
import SkeletonBase from './SkeletonBase.vue'

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
    <SkeletonBase :width="width" :height="height" />
  </div>
</template>
