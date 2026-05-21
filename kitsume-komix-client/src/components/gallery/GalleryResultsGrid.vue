<script setup lang="ts">
import ComicSeriesCard from '../ComicSeriesCard.vue';

import type { ComicSeriesListItem } from '@/types';

defineProps<{
  comics: ComicSeriesListItem[];
}>();
</script>

<template>
  <div class="grid grid-cols-5 gap-6">
    <ComicSeriesCard
      v-for="comic in comics"
      :key="comic.id"
      :comicSeriesData="comic"
    />
  </div>
</template>
