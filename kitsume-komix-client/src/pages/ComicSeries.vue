<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useComicSeriesStore } from '@/stores/comic-series';

const comicSeriesStore = useComicSeriesStore();
const comicSeriesData = ref<any | null>(null);

onMounted(async () => {
	const route = useRoute();
	const id = route.params.id;
	const idStr = Array.isArray(id) ? id[0] : id;
	const idNum = parseInt(idStr, 10);
	if (isNaN(idNum)) {
		// Handle invalid ID, e.g., redirect or show error
		return;
	}
	const lookupResult = await comicSeriesStore.lookupComicSeriesById(idNum);
	if (lookupResult) {
		comicSeriesData.value = lookupResult;
	} else {
		// Handle not found, e.g., redirect or show error
		console.log('Comic series not found');
	}
});

</script>

<template>
	<div
		class="comic-series-page flex flex-col w-full h-full p-4 overflow-auto"
	>
		<div
			class="comic-series-page-details bg-cyan-800 h-120 w-full rounded-2xl flex"
		>
			<!-- Placeholder for ComicSeries details -->
			<div class="comic-series-page-details-thumbnail h-full rounded-l-2xl ">
				<img
					src="https://placehold.co/400x600/grey/white?text=Comic+Series+Thumbnail"
					alt="Comic Series Thumbnail"
					class="object-contain h-full pl-5 py-5"
				/>
			</div>

			<div 
				class="comic-series-page-details-info h-full m-6"
			>
				<div class="comic-series-page-details-title text-shadow-lg font-bold text-4xl">
					{{ comicSeriesData?.name || 'Comic Series Title' }}
				</div>
			</div>
		</div>

		<div
			class="comic-series-page-contents"
		>
			<!-- Placeholder for ComicSeries contents such as list of comics -->
			<div>

			</div>
		</div>
	</div>
</template>