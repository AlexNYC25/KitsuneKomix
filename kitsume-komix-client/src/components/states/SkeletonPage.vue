<script setup lang="ts">
import Skeleton from 'primevue/skeleton'

import SkeletonCard from './SkeletonCard.vue'

withDefaults(defineProps<{
  layout?: 'home' | 'series' | 'book' | 'settings'
}>(), {
  layout: 'home'
})
</script>

<template>
  <div class="skeleton-page p-4 space-y-6">
    <!-- Home layout: title skeleton + 6 cards in grid -->
    <template v-if="layout === 'home'">
      <Skeleton width="200px" height="32px" />
      <div class="grid grid-cols-3 gap-4">
        <SkeletonCard v-for="i in 6" :key="i" height="180px" />
      </div>
      <Skeleton width="200px" height="32px" />
      <div class="grid grid-cols-3 gap-4">
        <SkeletonCard v-for="i in 6" :key="i" height="180px" />
      </div>
    </template>

    <!-- Series layout: header + details block + grid of comics -->
    <template v-else-if="layout === 'series'">
      <div class="flex gap-6">
        <Skeleton width="200px" height="280px" />
        <div class="flex-1 space-y-4">
          <Skeleton width="60%" height="40px" />
          <Skeleton width="100%" height="16px" />
          <Skeleton width="100%" height="16px" />
          <Skeleton width="80%" height="16px" />
        </div>
      </div>
      <Skeleton width="150px" height="32px" />
      <div class="grid grid-cols-5 gap-4">
        <SkeletonCard v-for="i in 10" :key="i" height="200px" />
      </div>
    </template>

    <!-- Book layout: header + thumbnail + metadata grid -->
    <template v-else-if="layout === 'book'">
      <Skeleton width="60%" height="40px" />
      <div class="flex gap-6">
        <Skeleton width="200px" height="300px" />
        <div class="flex-1 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div v-for="i in 6" :key="i" class="space-y-2">
              <Skeleton width="60px" height="14px" />
              <Skeleton width="120px" height="20px" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Settings layout: sections with form-like blocks -->
    <template v-else-if="layout === 'settings'">
      <Skeleton width="120px" height="32px" />
      <Skeleton width="100%" height="200px" />
      <Skeleton width="100%" height="120px" />
    </template>
  </div>
</template>
