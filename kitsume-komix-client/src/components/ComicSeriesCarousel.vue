<script setup lang="ts">
import { ref } from 'vue';

import Button from 'primevue/button';

defineProps(['comicSeriesData', 'labelText'])
const carousel = ref<HTMLElement | null>(null)

const scrollLeft = () => {
  carousel.value?.scrollBy({ left: -300, behavior: 'smooth' })
}

const scrollRight = () => {
  carousel.value?.scrollBy({ left: 300, behavior: 'smooth' })
}
</script>

<template>
  <div class="w-full py-4">
    <!-- Text label above the carousel -->
    <div class="text-lg font-bold mb-2 ml-4">
      {{ labelText }}
    </div>

    <div class="relative w-full overflow-hidden">
      <!-- Scroll buttons -->
      <Button
        @click="scrollLeft"
        unstyled
        class="absolute left-0 top-1/2 -translate-y-1/2 shadow px-2 py-1 z-20 hover:bg-slate-600/50"
      >
        <
      </Button>

      <div
        ref="carousel"
        class="flex overflow-x-auto scroll-smooth space-x-4 px-4 py-4 no-scrollbar"
      >
        <div
          v-for="(item, index) in comicSeriesData"
          :key="index"
          class="comic-series-card w-64 h-128 rounded shadow-md flex flex-col justify-between bg-slate-700"
        >
          <!-- Header -->
          <div class="w-full">
            <img :src="item.thumbnailUrl" :alt="item.name" class="w-full p-3 rounded-t" />
          </div>

          <!-- Title -->
          <div class="h-12 text-center text-ellipsis p-2">
            {{ item.name }}
          </div>

          <!-- Footer -->
          <div class="relative w-full h-12 p-2 my-5 ">
            <button class="absolute bottom-0 right-0 bg-blue-500 text-white px-4 py-2 mr-3 rounded hover:bg-blue-600">
              Read
            </button>
          </div>
        </div>
      </div>

      <Button
        @click="scrollRight"
        unstyled
        class="absolute right-0 top-1/2 -translate-y-1/2 shadow px-2 py-1 z-10"
      >
        >
      </Button>
    </div>
  </div>
</template>
