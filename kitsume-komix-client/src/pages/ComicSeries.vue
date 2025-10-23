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
					:src="'http://localhost:8000' + comicSeriesData?.thumbnailUrl || 'https://via.placeholder.com/300x450?text=No+Image'"
					alt="Comic Series Thumbnail"
					class="object-contain h-full pl-5 py-5"
				/>
			</div>

			<div class="comic-series-page-details-content-details">

			</div>

			<div 
				class="comic-series-page-details-info h-full m-6"
			>
				<div class="comic-series-page-details-title text-shadow-lg font-bold text-4xl">
					{{ comicSeriesData?.name }}
				</div>
				<div class="comic-series-page-details-description mt-4 text-lg">
					{{ comicSeriesData?.description }}
				</div>

				<div
					class="comic-series-page-details-stats flex"
				>
					<!-- Placeholder for ComicSeries stats such as year x of y issue, type i.e. ongoing or limited -->
				</div>

				<div
					class="comic-series-page-details-contents"
				>
					<div
						class="comic-series-page-detail-contents-characters flex flex-wrap w-full"
					>
						<div class="font-bold">Characters:&nbsp;</div>
						<div 
							v-for="(value, index) in comicSeriesData?.metadata.characters.split(',')" 
							:key="index"
							class="comic-series-page-detail-credit-item"
						>
							<div>{{ value }},&nbsp;</div>
						</div>
					</div>


					<div
						class="comic-series-page-detail-contents-teams flex flex-wrap w-full"
					>
						<div class="font-bold">Teams:&nbsp;</div>
						<div 
							v-for="(value, index) in comicSeriesData?.metadata.teams.split(',')" 
							:key="index"
							class="comic-series-page-detail-credit-item"
						>
							<div>{{ value }},&nbsp;</div>
						</div>
					</div>
				</div>

				<div
					class="comic-series-page-detail-credits mt-4"
				>
					<div
						class="comic-series-page-detail-credits-writers flex flex-wrap"
					>
						<div class="font-bold">Writers:&nbsp;</div>
						<div 
							v-for="(value, index) in comicSeriesData?.metadata.writers.split(',')" 
							:key="index"
							class="comic-series-page-detail-credit-item"
						>
							<div>{{ value }},&nbsp;</div>
						</div>
					</div>
						

					<div
						class="comic-series-page-detail-credits-colorists flex"
					>
						<div class="font-bold">Colorists:&nbsp;</div>
						<div
							v-for="(value, index) in comicSeriesData?.metadata.colorists.split(',')"
							:key="index"
							class="comic-series-page-detail-credit-item"
						>
							<div>{{ value }},&nbsp;</div>
						</div>
					</div>

					<div
						class="comic-series-page-detail-credits-cover-artists flex flex-wrap"
					>
						<div class="font-bold overflow-auto">Cover Artists:&nbsp;</div>
						<div
							v-for="(value, index) in comicSeriesData?.metadata.coverArtists.split(',')"
							:key="index"
							class="comic-series-page-detail-credit-item"
						>
							<div>{{ value }},&nbsp;</div>
						</div>
					</div>


					<div
						class="comic-series-page-detail-credits-inkers flex"
					>
						<div class="font-bold">Inkers:&nbsp;</div>
						<div
							v-for="(value, index) in comicSeriesData?.metadata.inkers.split(',')"
							:key="index"
							class="comic-series-page-detail-credit-item"
						>
							<div>{{ value }},&nbsp;</div>
						</div>
					</div>

					<div
						class="comic-series-page-detail-credits-letterers flex"
					>
						<div class="font-bold">Letterers:&nbsp;</div>
						<div
							v-for="(value, index) in comicSeriesData?.metadata.letterers.split(',')"
							:key="index"
							class="comic-series-page-detail-credit-item"
						>
							<div>{{ value }},&nbsp;</div>
						</div>
					</div>

					<div
						class="comic-series-page-detail-credits-editors flex"
					>
						<div class="font-bold">Editors:&nbsp;</div>
						<div
							v-for="(value, index) in comicSeriesData?.metadata.editors.split(',')"
							:key="index"
							class="comic-series-page-detail-credit-item"
						>
							<div>{{ value }},&nbsp;</div>
						</div>
					</div>
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