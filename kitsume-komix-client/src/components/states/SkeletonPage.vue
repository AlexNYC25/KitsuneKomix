<script setup lang="ts">
import SkeletonBase from './SkeletonBase.vue'
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
      <SkeletonBase width="200px" height="32px" />
      <div class="grid grid-cols-3 gap-4">
        <SkeletonCard v-for="i in 6" :key="i" height="180px" />
      </div>
      <SkeletonBase width="200px" height="32px" />
      <div class="grid grid-cols-3 gap-4">
        <SkeletonCard v-for="i in 6" :key="i" height="180px" />
      </div>
    </template>

    <!-- Series layout: header + details block + grid of comics -->
    <template v-else-if="layout === 'series'">
      <div class="flex gap-6">
        <SkeletonBase width="200px" height="280px" />
        <div class="flex-1 space-y-4">
          <SkeletonBase width="60%" height="40px" />
          <SkeletonBase width="100%" height="16px" />
          <SkeletonBase width="100%" height="16px" />
          <SkeletonBase width="80%" height="16px" />
        </div>
      </div>
      <SkeletonBase width="150px" height="32px" />
      <div class="grid grid-cols-5 gap-4">
        <SkeletonCard v-for="i in 10" :key="i" height="200px" />
      </div>
    </template>

    <!-- Book layout: header + thumbnail + metadata grid -->
    <template v-else-if="layout === 'book'">
      <SkeletonBase width="60%" height="40px" />
      <div class="flex gap-6">
        <SkeletonBase width="200px" height="300px" />
        <div class="flex-1 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div v-for="i in 6" :key="i" class="space-y-2">
              <SkeletonBase width="60px" height="14px" />
              <SkeletonBase width="120px" height="20px" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Settings layout: sections with form-like blocks -->
    <template v-else-if="layout === 'settings'">
      <SkeletonBase width="120px" height="32px" />
      <SkeletonBase width="100%" height="200px" />
      <SkeletonBase width="100%" height="120px" />
    </template>
  </div>
</template>
