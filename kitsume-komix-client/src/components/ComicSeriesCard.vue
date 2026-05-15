<script setup lang="ts">
import { useRouter } from 'vue-router';

import { toAbsoluteImageUrl } from '@/utilities/image';

import type { ComicSeriesListItem } from '@/types';

const router = useRouter();

const props = defineProps<{
	comicSeriesData: ComicSeriesListItem;
}>();

const goToComicSeries = (id: string | number) => {
	router.push(`/comic-series/${String(id)}`);
}

const imageUrl = props.comicSeriesData.thumbnailUrl ? toAbsoluteImageUrl(props.comicSeriesData.thumbnailUrl) : '';

</script>

<template>
	<div class="comic-series-card flex flex-col w-64 cursor-pointer" @click="goToComicSeries(comicSeriesData.id)">
		<div class="thumbnail relative w-full h-full bg-gray-200 rounded overflow-hidden">
			<!-- Thumbnail -->
			<img 
				v-if="comicSeriesData.thumbnailUrl" 
				:src="imageUrl"  
				:alt="comicSeriesData.name" 
				class="w-full h-full object-fit"
			/>
			<div v-else class="w-full h-full flex items-center justify-center text-gray-500">
				No Image
			</div>

			<!-- Overlay on hover -->
			<div class="absolute inset-0 bg-black opacity-0 hover:opacity-65 transition-opacity duration-300 flex flex-col text-white text-4xl  font-bold items-start justify-end">
				<!-- Title -->
				<div class="font-display">
					{{ comicSeriesData.name }}
				</div>
				<!-- Total comic books -->
				<div class="text-sm">
					{{ comicSeriesData.totalComicBooks }} Book{{ comicSeriesData.totalComicBooks !== 1 ? 's' : '' }}
				</div>
			</div>

			<!-- Always-visible badge: top-right -->
			<div class="absolute top-2 right-2 flex items-center justify-center w-10 h-10  rounded-full bg-brand-accent text-white text-xs font-bold shadow-md leading-none text-center">
				{{ comicSeriesData.totalComicBooks }}
			</div>
		</div>
	</div>
</template>