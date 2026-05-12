<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import type { LatestComicSeriesSingle } from '@/types/comic-series.types';
import { resolveImageSrc, toAbsoluteImageUrl, isProtectedImageUrl, revokeBlobUrls } from '@/utilities/image';

const props = defineProps<{
  comicSeriesData: LatestComicSeriesSingle[];
}>();
const router = useRouter();
const authStore = useAuthStore();

const activeIndex = ref(0);
const showArrows = ref(false);

const thumbnailBlobUrls = ref<Record<string, string>>({});

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

const getThumbnailSrc = (item: LatestComicSeriesSingle): string => {
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

const goToComicSeries = (id: string | number) => {
  router.push(`/comic-series/${String(id)}`);
};

const goToPrev = () => {
  if (activeIndex.value > 0) {
    activeIndex.value--;
  }
};

const goToNext = () => {
  if (activeIndex.value < props.comicSeriesData.length - 1) {
    activeIndex.value++;
  }
};

const visibleThumbnailCount = computed(() => {
  if (typeof window === 'undefined') return 5;
  if (window.innerWidth < 575) return 3;
  return 5;
});
</script>

<template>
  <div class="w-full">
    <div
      class="relative w-full h-[400px] overflow-hidden rounded-lg bg-surface-base"
      @mouseenter="showArrows = true"
      @mouseleave="showArrows = false"
    >
      <div
        v-for="(item, index) in comicSeriesData"
        :key="item.id"
        class="absolute inset-0 transition-opacity duration-500 cursor-pointer"
        :class="index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'"
        @click="goToComicSeries(item.id)"
      >
        <img
          :src="getThumbnailSrc(item)"
          :alt="item.name"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div class="absolute bottom-0 left-0 p-6 w-full flex justify-between items-end">
          <h2 class="text-3xl font-bold text-white drop-shadow-md">{{ item.name }}</h2>
          <span class="bg-black/60 text-brand px-3 py-1 rounded-full font-semibold backdrop-blur-sm border border-white/10">
            {{ item.totalComicBooks }} Issues
          </span>
        </div>
      </div>

      <button
        v-if="comicSeriesData.length > 1"
        @click="goToPrev"
        :disabled="activeIndex === 0"
        class="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        :class="showArrows ? 'opacity-100' : 'opacity-0'"
      >
        <v-icon name="io-chevron-back" />
      </button>
      <button
        v-if="comicSeriesData.length > 1"
        @click="goToNext"
        :disabled="activeIndex === comicSeriesData.length - 1"
        class="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        :class="showArrows ? 'opacity-100' : 'opacity-0'"
      >
        <v-icon name="io-chevron-forward" />
      </button>
    </div>

    <div class="flex items-center justify-center gap-2 mt-3">
      <button
        v-for="(item, index) in comicSeriesData"
        :key="item.id"
        @click="activeIndex = index"
        class="w-2.5 h-2.5 rounded-full transition-all duration-200"
        :class="index === activeIndex ? 'bg-brand w-6' : 'bg-surface-overlay hover:bg-text-muted'"
      />
    </div>

    <div class="flex gap-2 mt-3 overflow-x-auto">
      <button
        v-for="(item, index) in comicSeriesData.slice(0, visibleThumbnailCount)"
        :key="item.id"
        @click="activeIndex = index"
        class="flex-shrink-0 w-1/5 min-w-0 transition-all duration-200 rounded overflow-hidden"
        :class="index === activeIndex ? 'ring-2 ring-brand opacity-100' : 'opacity-60 hover:opacity-80'"
      >
        <img
          :src="getThumbnailSrc(item)"
          :alt="item.name"
          class="w-full h-[80px] object-cover"
        />
      </button>
    </div>
  </div>
</template>
