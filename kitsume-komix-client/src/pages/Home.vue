<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useHomeStore } from '@/stores/home';
import { useAuthStore } from '@/stores/auth';

import { Galleria } from 'primevue';
import Carousel from 'primevue/carousel';
import Button from 'primevue/button';

import ComicSeriesCarousel from '@/components/ComicSeriesCarousel.vue';

const homeStore = useHomeStore();
const authStore = useAuthStore();

// Fetch data after component is mounted to ensure auth store is ready
onMounted(async () => {
	if (authStore.isAuthenticated) {
		try {
			await homeStore.fetchLatestSeries();
			await homeStore.fetchUpdatedSeries();
		} catch (error) {
			console.error('Failed to fetch latest series on home page:', error);
		}
	}
});

const latestSeries = computed(() => homeStore.getLatestSeries);
const updatedSeries = computed(() => homeStore.getUpdatedSeries);

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
const images = ref(
	[
		{
			itemImageSrc: 'https://placehold.co/1600x400/blue/white',
			thumbnailImageSrc: 'https://placehold.co/600x400/blue/white',
			alt: 'Description for Image 1',
			title: 'Title 1'
		},
		{
			itemImageSrc: 'https://placehold.co/1600x400/orange/white',
			thumbnailImageSrc: 'https://placehold.co/600x400/orange/white',
			alt: 'Description for Image 2',
			title: 'Title 2'
		},
		{
			itemImageSrc: 'https://placehold.co/1600x400/yellow/white',
			thumbnailImageSrc: 'https://placehold.co/600x400/yellow/white',
			alt: 'Description for Image 3',
			title: 'Title 3'
		},
		{
			itemImageSrc: 'https://placehold.co/1600x400/green/white',
			thumbnailImageSrc: 'https://placehold.co/600x400/green/white',
			alt: 'Description for Image 4',
			title: 'Title 4'
		},
		{
			itemImageSrc: 'https://placehold.co/1600x400/black/white',
			thumbnailImageSrc: 'https://placehold.co/600x400/black/white',
			alt: 'Description for Image 5',
			title: 'Title 5'
		},
		{
			itemImageSrc: 'https://placehold.co/1600x400/purple/white',
			thumbnailImageSrc: 'https://placehold.co/600x400/purple/white',
			alt: 'Description for Image 6',
			title: 'Title 6'
		}
	]
)

</script>

<template>
	<div class="home flex flex-col w-full overflow-auto p-4">
		<div class="card w-full">
			<Galleria :value="images" :responsiveOptions="responsiveOptions" :numVisible="5" :circular="false"
				:showItemNavigators="true" :showThumbnails="false" :showItemNavigatorsOnHover="true" :showIndicators="true">
				<template #item="slotProps" class="flex justify-center">
					<img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" />
				</template>
				<template #thumbnail="slotProps">
					<img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" />
				</template>
			</Galleria>
		</div>

		<div id="home-latest-series" class="card w-full">
			<ComicSeriesCarousel :comicSeriesData="latestSeries" labelText="Latest Series" />
		</div>

		<div id="home-updated-series" class="card w-full">
			<ComicSeriesCarousel :comicSeriesData="updatedSeries" labelText="Updated Series" />
		</div>


	</div>
</template>

<style scoped>

</style>