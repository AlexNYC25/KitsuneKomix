<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useHomeStore } from '@/stores/home';
import { useAuthStore } from '@/stores/auth';

import ComicSeriesCarousel from '@/components/ComicSeriesCarousel.vue';
import HomePageGalleria from '@/components/HomePageGalleria.vue';

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

</script>

<template>
	<div class="home flex flex-col w-full overflow-auto p-4">
		<div class="card w-full">
			<HomePageGalleria />
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