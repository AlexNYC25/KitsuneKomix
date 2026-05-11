<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useHomeStore } from '@/stores/home';
import { useAuthStore } from '@/stores/auth';

import ComicSeriesCarousel from '@/components/ComicSeriesCarousel.vue';
import HomePageGalleria from '@/components/HomePageGalleria.vue';
import ErrorBoundary from '@/components/states/ErrorBoundary.vue';
import EmptyState from '@/components/states/EmptyState.vue';
import SkeletonPage from '@/components/states/SkeletonPage.vue';

const homeStore = useHomeStore();
const authStore = useAuthStore();

const isLoading = ref(false);

// Fetch data after component is mounted to ensure auth store is ready
onMounted(async () => {
	if (authStore.isAuthenticated) {
		isLoading.value = true;
		try {
			await homeStore.fetchLatestSeries();
			await homeStore.fetchUpdatedSeries();
		} catch (error) {
			console.error('Failed to fetch latest series on home page:', error);
		} finally {
			isLoading.value = false;
		}
	}
});

const latestSeries = computed(() => homeStore.latestSeries);
const updatedSeries = computed(() => homeStore.updatedSeries);

const hasData = computed(() =>
	latestSeries.value.length > 0 || updatedSeries.value.length > 0
);

</script>

<template>
	<div class="home flex flex-col w-full overflow-auto p-4">
		<template v-if="isLoading">
			<SkeletonPage layout="home" />
		</template>
		<template v-else-if="!hasData">
			<EmptyState
				icon="md-menubook-sharp"
				title="Welcome to Kitsune Komix"
				message="Add a library in Settings to start scanning for your comics."
				actionLabel="Go to Settings"
				actionRoute="/settings"
			/>
		</template>
		<template v-else>
			<ErrorBoundary>
				<div class="card w-full">
					<HomePageGalleria :comicSeriesData="latestSeries" />
				</div>
			</ErrorBoundary>

			<ErrorBoundary>
				<div id="home-latest-series" class="card w-full">
					<ComicSeriesCarousel :comicSeriesData="latestSeries" labelText="Latest Series" />
				</div>
			</ErrorBoundary>

			<ErrorBoundary>
				<div id="home-updated-series" class="card w-full">
					<ComicSeriesCarousel :comicSeriesData="updatedSeries" labelText="Updated Series" />
				</div>
			</ErrorBoundary>
		</template>
	</div>
</template>
