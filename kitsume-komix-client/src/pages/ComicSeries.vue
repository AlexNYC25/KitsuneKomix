<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useComicSeriesStore } from '@/stores/comic-series';
import ComicSeriesPageDetails from '@/components/ComicSeriesPageDetails.vue';

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
					class="comic-series-page-details-contents mt-4"
				>
					<div
						class="comic-series-page-detail-contents-characters flex flex-wrap w-full"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Characters'" :comicMetadataDetails="comicSeriesData?.metadata.characters" />
					</div>


					<div
						class="comic-series-page-detail-contents-teams flex flex-wrap w-full"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Teams'" :comicMetadataDetails="comicSeriesData?.metadata.teams" />
					</div>
				</div>

				<div
					class="comic-series-page-detail-credits mt-4"
				>
					<div
						class="comic-series-page-detail-credits-writers flex flex-wrap"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Writers'" :comicMetadataDetails="comicSeriesData?.metadata.writers" />
					</div>
						

					<div
						class="comic-series-page-detail-credits-colorists flex"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Colorists'" :comicMetadataDetails="comicSeriesData?.metadata.colorists" />
					</div>

					<div
						class="comic-series-page-detail-credits-cover-artists flex flex-wrap"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Cover Artists'" :comicMetadataDetails="comicSeriesData?.metadata.coverArtists" />
					</div>


					<div
						class="comic-series-page-detail-credits-inkers flex"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Inkers'" :comicMetadataDetails="comicSeriesData?.metadata.inkers" />
					</div>

					<div
						class="comic-series-page-detail-credits-letterers flex"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Letterers'" :comicMetadataDetails="comicSeriesData?.metadata.letterers" />
					</div>

					<div
						class="comic-series-page-detail-credits-editors flex"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Editors'" :comicMetadataDetails="comicSeriesData?.metadata.editors" />
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