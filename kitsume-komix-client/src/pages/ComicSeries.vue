<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useComicSeriesStore } from '@/stores/comic-series';
import type { ComicBooksSeriesResponse } from '@/types/comic-books.types';
import ComicSeriesPageDetails from '@/components/ComicSeriesPageDetails.vue';
import Paginator from 'primevue/paginator';
import Button from 'primevue/button';

const comicSeriesStore = useComicSeriesStore();
const comicSeriesData = ref<any | null>(null);
const comicsData = ref<ComicBooksSeriesResponse | null>(null);
const currentPage = ref(0);
const itemsPerPage = 25;
const viewMode = ref<'grid' | 'list'>('grid');
const isLoading = ref(true);

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

	// Fetch comics in the series
	try {
		const response = await comicSeriesStore.fetchComicsInSeries(idNum);
		comicsData.value = response;
		console.log('Comics data fetched:', response);
	} catch (error) {
		console.error('Error fetching comics in series:', error);
	} finally {
		isLoading.value = false;
	}
});

const totalComics = computed(() => comicsData.value?.data?.length || 0);

const paginatedComics = computed(() => {
	if (!comicsData.value?.data) return [];
	// Sort by issue number (numerically)
	const sorted = [...comicsData.value.data].sort((a, b) => {
		const aNum = parseFloat(a.issueNumber ?? '0') || 0;
		const bNum = parseFloat(b.issueNumber ?? '0') || 0;
		return aNum - bNum;
	});
	const start = currentPage.value * itemsPerPage;
	const end = start + itemsPerPage;
	return sorted.slice(start, end);
});

const onPageChange = (event: any) => {
	currentPage.value = event.page;
};

const toggleViewMode = (mode: 'grid' | 'list') => {
	viewMode.value = mode;
	currentPage.value = 0; // Reset to first page when switching views
};


</script>

<template>
	<div
		class="comic-series-page flex flex-col w-full h-full p-4 overflow-auto"
	>
		<div
			class="comic-series-page-details bg-cyan-800 h-auto w-full rounded-2xl object-cover grid grid-cols-4"
		>
			<!-- Placeholder for ComicSeries details -->
			<div class="comic-series-page-details-thumbnail col-span-1 h-full flex items-center justify-center">
				<img
					:src="'http://localhost:8000' + comicSeriesData?.thumbnailUrl || 'https://via.placeholder.com/300x450?text=No+Image'"
					alt="Comic Series Thumbnail"
					class="object-contain h-full px-5 py-5"
				/>
			</div>

			<div 
				class="comic-series-page-details-info h-full m-6 col-span-3"
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
						class="comic-series-page-detail-contents-characters"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Characters'" :comicMetadataDetails="comicSeriesData?.metadata.characters" />
					</div>


					<div
						class="comic-series-page-detail-contents-teams"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Teams'" :comicMetadataDetails="comicSeriesData?.metadata.teams" />
					</div>
				</div>

				<div
					class="comic-series-page-detail-credits mt-4"
				>
					<div
						class="comic-series-page-detail-credits-writers"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Writers'" :comicMetadataDetails="comicSeriesData?.metadata.writers" />
					</div>
						

					<div
						class="comic-series-page-detail-credits-colorists"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Colorists'" :comicMetadataDetails="comicSeriesData?.metadata.colorists" />
					</div>

					<div
						class="comic-series-page-detail-credits-cover-artists"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Cover Artists'" :comicMetadataDetails="comicSeriesData?.metadata.coverArtists" />
					</div>


					<div
						class="comic-series-page-detail-credits-inkers"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Inkers'" :comicMetadataDetails="comicSeriesData?.metadata.inkers" />
					</div>

					<div
						class="comic-series-page-detail-credits-letterers"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Letterers'" :comicMetadataDetails="comicSeriesData?.metadata.letterers" />
					</div>

					<div
						class="comic-series-page-detail-credits-editors"
					>
						<ComicSeriesPageDetails :comicMetadataDetailsLabel="'Editors'" :comicMetadataDetails="comicSeriesData?.metadata.editors" />
					</div>
				</div>
			</div>
		</div>

		<div
			class="comic-series-page-contents mt-8"
		>
			<!-- Header with title and view toggle buttons -->
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-2xl font-bold">Comic Issues</h2>
				<div class="flex gap-2">
					<Button 
						icon="pi pi-th-large"
						:severity="viewMode === 'grid' ? 'info' : 'secondary'"
						@click="toggleViewMode('grid')"
						v-tooltip="'Grid View'"
						size="small"
					/>
					<Button 
						icon="pi pi-bars"
						:severity="viewMode === 'list' ? 'info' : 'secondary'"
						@click="toggleViewMode('list')"
						v-tooltip="'List View'"
						size="small"
					/>
				</div>
			</div>

			<!-- Loading state -->
			<div v-if="isLoading" class="text-center py-8">
				<p class="text-gray-500">Loading comics...</p>
			</div>
			
			<!-- Grid View -->
			<div v-else-if="viewMode === 'grid' && paginatedComics.length > 0">
				<div class="grid grid-cols-5 gap-4">
					<div 
						v-for="(comic, index) in paginatedComics" 
						:key="index"
						class="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
					>
						<!-- Comic Card -->
						<div class="w-full aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
							<img
								v-if="comic.thumbnailUrl"
								:src="`http://localhost:8000${comic.thumbnailUrl}`"
								:alt="`Issue ${comic.issueNumber}`"
								class="w-full h-full object-contain"
							/>
							<div v-else class="w-full h-full bg-gray-800 flex items-center justify-center">
								<span class="text-gray-500">No Image</span>
							</div>
						</div>
						<!-- Issue Number -->
						<p class="text-sm font-semibold text-center">Issue {{ comic.issueNumber || 'Unknown' }}</p>
					</div>
				</div>
			</div>

			<!-- List View -->
			<div v-else-if="viewMode === 'list' && paginatedComics.length > 0" class="space-y-2">
				<!-- Placeholder list items -->
				<div v-for="(comic, index) in paginatedComics" :key="index" class="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border-l-4 border-cyan-800">
					<div class="flex items-center justify-between">
						<div class="flex-1">
							<p class="font-semibold">Issue {{ comic.issueNumber || 'Unknown' }}</p>
							<p class="text-sm text-gray-600">Release Date: {{ comic.publicationDate || 'TBD' }} | Pages: {{ comic.pageCount || 'TBD' }}</p>
						</div>
						<div class="text-sm text-gray-500">
							Read Status: Unread
						</div>
					</div>
				</div>
			</div>

			<!-- Empty state -->
			<div v-else-if="!isLoading && paginatedComics.length === 0" class="text-center py-8">
				<p class="text-gray-500">No comics available for this series</p>
			</div>

			<!-- Paginator for comic issues -->
			<div class="mt-6">
				<Paginator 
					v-if="totalComics > itemsPerPage"
					:first="currentPage * itemsPerPage"
					:rows="itemsPerPage"
					:totalRecords="totalComics"
					@page="onPageChange"
					:rowsPerPageOptions="[itemsPerPage]"
					template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
				/>
				<div v-else-if="totalComics > 0 && !isLoading" class="text-center text-gray-500 mt-4">
					Showing all {{ totalComics }} comic issue(s)
				</div>
			</div>
		</div>
	</div>
</template>