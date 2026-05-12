<script setup lang="ts">
import Button from 'primevue/button';
import { ref, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

import SkeletonCard from '@/components/states/SkeletonCard.vue';
import { useAuthStore } from '@/stores/auth';
import type { ComicSeriesCarouselItem } from '@/types/comic-series.types';
import { resolveImageSrc, toAbsoluteImageUrl, isProtectedImageUrl, revokeBlobUrls } from '@/utilities/image';

const props = withDefaults(defineProps<{
  comicSeriesData: ComicSeriesCarouselItem[];
  labelText: string;
  isLoading?: boolean;
}>(), {
  isLoading: false
});
const router = useRouter();
const authStore = useAuthStore();

const carousel = ref<HTMLElement | null>(null)
const thumbnailBlobUrls = ref<Record<string, string>>({})
const revokeAllThumbnailUrls = () => {
  revokeBlobUrls(Object.values(thumbnailBlobUrls.value));
  thumbnailBlobUrls.value = {};
};

const loadThumbnails = async () => {
  revokeAllThumbnailUrls();

  const nextBlobUrls: Record<string, string> = {};

  await Promise.all(
    (props.comicSeriesData ?? []).map(async (item) => {
      if (!item.thumbnailUrl) {
        return;
      }

      const resolvedSrc = await resolveImageSrc(item.thumbnailUrl);
      if (resolvedSrc) {
        nextBlobUrls[String(item.id)] = resolvedSrc;
      }
    })
  );

  thumbnailBlobUrls.value = nextBlobUrls;
};

const getThumbnailSrc = (item: ComicSeriesCarouselItem): string => {
  const itemId = String(item.id);
  if (thumbnailBlobUrls.value[itemId]) {
    return thumbnailBlobUrls.value[itemId];
  }

  if (!item.thumbnailUrl) {
    return '';
  }

  const requestUrl = toAbsoluteImageUrl(item.thumbnailUrl);
  if (isProtectedImageUrl(requestUrl)) {
    return '';
  }

  return requestUrl;
};

watch(
  () => [props.comicSeriesData, authStore.token],
  () => {
    void loadThumbnails();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  revokeAllThumbnailUrls();
});

const scrollLeft = () => {
  carousel.value?.scrollBy({ left: -300, behavior: 'smooth' })
}

const scrollRight = () => {
  carousel.value?.scrollBy({ left: 300, behavior: 'smooth' })
}

const goToComicSeries = (id: string | number) => {
  router.push(`/comic-series/${String(id)}`);
}
</script>

<template>
  <div class="w-full py-4">
    <!-- Text label above the carousel -->
    <div class="flex justify-between items-center mb-2 px-4">
      <div class="text-lg font-bold">
        {{ labelText }}
      </div>
      <span class="text-sm text-brand cursor-pointer hover:underline">
        See All
      </span>
    </div>

    <div class="relative w-full overflow-hidden">
      <!-- Scroll buttons -->
      <Button
        @click="scrollLeft"
        unstyled
        class="left-0 w-12 h-12 rounded-full absolute top-1/2 -translate-y-1/2 shadow px-2 py-1 z-20 hover:bg-slate-600/50 text-brand border border-white/10 hover:border-brand/30 hover:text-brand transition-colors duration-200"
        icon="pi pi-chevron-left"
      ></Button>

      <div
        ref="carousel"
        class="flex overflow-x-auto scroll-smooth space-x-4 px-4 py-4 no-scrollbar"
      >
        <template v-if="isLoading">
          <SkeletonCard v-for="i in 6" :key="`skeleton-${i}`" class="w-64 h-128 flex-shrink-0" />
        </template>
        <template v-else>
          <div
            v-for="(item, index) in comicSeriesData"
            :key="item.id"
            :class="[
              'comic-series-card relative w-64 h-128 flex-shrink-0 rounded shadow-md flex flex-col justify-between bg-slate-700 hover:scale-105 transition-all duration-200 hover:shadow-lg hover:shadow-brand/20 group overflow-hidden',
              index < 12 ? 'animate-fade-in-up' : ''
            ]"
            :style="index < 12 ? { animationDelay: index * 50 + 'ms' } : {}"
          >
            <!-- Hover Overlay -->
            <div class="absolute inset-0 bg-brand/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center p-4 pointer-events-none">
              <span class="text-white font-bold text-xl text-center drop-shadow-md">{{ item.name }}</span>
            </div>

            <!-- Header -->
            <div class="w-full">
              <img
                v-if="getThumbnailSrc(item)"
                :src="getThumbnailSrc(item)"
                :alt="item.name"
                class="w-full p-3 rounded-t"
              />
            </div>

            <!-- Title -->
            <div class="h-12 text-center text-ellipsis p-2">
              {{ item.name }}
            </div>

            <!-- Footer -->
            <div class="relative w-full h-12 p-2 my-5 ">
              <button 
                @click="goToComicSeries(item.id)"
                class="absolute bottom-0 right-0 bg-blue-500 text-white px-4 py-2 mr-3 rounded hover:bg-blue-600"
              >
                Read
              </button>
            </div>
          </div>
        </template>
      </div>

      <Button
        @click="scrollRight"
        unstyled
        class="right-0 w-12 h-12 rounded-full absolute top-1/2 -translate-y-1/2 shadow px-2 py-1 z-10 hover:bg-slate-600/50 text-brand border border-white/10 hover:border-brand/30 hover:text-brand transition-colors duration-200"
        icon="pi pi-chevron-right"
      ></Button>
    </div>
  </div>
</template>
