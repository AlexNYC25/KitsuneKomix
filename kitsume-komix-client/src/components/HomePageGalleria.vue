<script setup lang="ts">
import Galleria from 'primevue/galleria';
import { ref, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import type { LatestComicSeriesSingle } from '@/types/comic-series.types';
import { resolveImageSrc, toAbsoluteImageUrl, isProtectedImageUrl, revokeBlobUrls } from '@/utilities/image';

const props = defineProps<{
  comicSeriesData: LatestComicSeriesSingle[];
}>();
const router = useRouter();
const authStore = useAuthStore();

const responsiveOptions = ref([
	{
		breakpoint: '991px',
		numVisible: 3
	},
	{
		breakpoint: '767px',
		numVisible: 3
	},
	{
		breakpoint: '575px',
		numVisible: 1
	}
]);

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
</script>

<template>
  <div class="card w-full">
		<Galleria
			:value="comicSeriesData"
			:responsiveOptions="responsiveOptions"
			:numVisible="5"
			:circular="false"
			:showItemNavigatorsOnHover="true"
			:showIndicators="true"
		>
			<template #item="slotProps">
				<div 
          class="relative w-full h-[400px] cursor-pointer overflow-hidden"
          @click="goToComicSeries(slotProps.item.id)"
        >
          <img 
            :src="getThumbnailSrc(slotProps.item)" 
            :alt="slotProps.item.name" 
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div class="absolute bottom-0 left-0 p-6 w-full flex justify-between items-end">
            <h2 class="text-3xl font-bold text-white drop-shadow-md">{{ slotProps.item.name }}</h2>
            <span class="bg-black/60 text-brand px-3 py-1 rounded-full font-semibold backdrop-blur-sm border border-white/10">
              {{ slotProps.item.totalComicBooks }} Issues
            </span>
          </div>
        </div>
			</template>
			<template #thumbnail="slotProps">
				<img 
          :src="getThumbnailSrc(slotProps.item)" 
          :alt="slotProps.item.name" 
          class="w-full h-[80px] object-cover"
        />
			</template>
		</Galleria>
	</div>
</template>
