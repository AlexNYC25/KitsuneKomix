<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useComicSeriesStore } from '@/stores/comic-series';
import type { ComicBooksSeriesResponse } from '@/types/comic-books.types';
import ComicSeriesPageDetails from '@/components/ComicSeriesPageDetails.vue';
import Paginator from 'primevue/paginator';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

const router = useRouter();
const route = useRoute();
const comicSeriesStore = useComicSeriesStore();
const comicSeriesData = ref<any | null>(null);
const comicsData = ref<ComicBooksSeriesResponse | null>(null);
const currentPage = ref(0);
const itemsPerPage = 25;
const viewMode = ref<'grid' | 'list'>('grid');
const isLoading = ref(true);
const activeTab = ref(0);

onMounted(async () => {
	const id = route.params.id;
	const idStr = Array.isArray(id) ? id[0] : id;
	const idNum = parseInt(idStr, 10);

	if (isNaN(idNum)) return;

	const lookupResult = await comicSeriesStore.lookupComicSeriesById(idNum);
	if (lookupResult) {
		comicSeriesData.value = lookupResult;
	}

	try {
		const response = await comicSeriesStore.fetchComicsInSeries(idNum);
		comicsData.value = response;
	} catch (error) {
		console.error('Error fetching comics in series:', error);
	} finally {
		isLoading.value = false;
	}
});

const totalComics = computed(() => comicsData.value?.data?.length || 0);

const paginatedComics = computed(() => {
	if (!comicsData.value?.data) return [];

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
	currentPage.value = 0;
};

const hasMetadata = (data: string | undefined): boolean => {
	return !!data && data.trim().length > 0;
};

const navigateToComicBook = (comicBookId: number) => {
	// Pass series ID in query param so ComicBook page knows which series it came from
	const seriesId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
	router.push(`/comic-book/${comicBookId}?seriesId=${seriesId}`);
};



</script>

<template>
	<div class="comic-series-page flex flex-col w-full h-full p-4 overflow-auto">
		<!-- Header -->
		<div class="flex items-center justify-between mb-6">
			
			<Button label="Back" icon="pi pi-arrow-left" @click="$router.back()" />
		</div>

		<!-- Series Details with Thumbnail -->
		<div class="bg-gray-800 rounded-lg p-6 space-y-4 mb-6">
			<div class="flex gap-6">
				<!-- Thumbnail -->
				<div class="flex-shrink-0 w-80 h-auto">
					<div class="aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
						<img
							v-if="comicSeriesData?.thumbnailUrl"
							:src="'http://localhost:8000' + comicSeriesData.thumbnailUrl"
							:alt="comicSeriesData?.name || 'Series Thumbnail'"
							class="w-full h-full object-contain"
						/>
						<div v-else class="w-full h-full bg-gray-700 flex items-center justify-center">
							<span class="text-gray-500">No Image</span>
						</div>
					</div>
				</div>

				<!-- Details -->
				<div class="flex-1">
          <h1 class="text-4xl font-bold">{{ comicSeriesData?.name || 'Series' }}</h1>
          
					<div v-if="comicSeriesData?.description" class="mb-4">
						<p class="text-gray-400 text-sm mb-2">Description</p>
						<p class="text-gray-300">{{ comicSeriesData.description }}</p>
					</div>

					<!-- Metadata Contents -->
					<div v-if="comicSeriesData?.metadata" class="space-y-3 border-t border-gray-700 pt-4">
						<ComicSeriesPageDetails 
							v-if="hasMetadata(comicSeriesData.metadata.characters)"
							:comicMetadataDetailsLabel="'Characters'" 
							:comicMetadataDetails="comicSeriesData.metadata.characters" 
							:maxVisible="5"
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(comicSeriesData.metadata.teams)"
							:comicMetadataDetailsLabel="'Teams'" 
							:comicMetadataDetails="comicSeriesData.metadata.teams" 
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(comicSeriesData.metadata.writers)"
							:comicMetadataDetailsLabel="'Writers'" 
							:comicMetadataDetails="comicSeriesData.metadata.writers" 
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(comicSeriesData.metadata.colorists)"
							:comicMetadataDetailsLabel="'Colorists'" 
							:comicMetadataDetails="comicSeriesData.metadata.colorists" 
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(comicSeriesData.metadata.coverArtists)"
							:comicMetadataDetailsLabel="'Cover Artists'" 
							:comicMetadataDetails="comicSeriesData.metadata.coverArtists" 
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(comicSeriesData.metadata.inkers)"
							:comicMetadataDetailsLabel="'Inkers'" 
							:comicMetadataDetails="comicSeriesData.metadata.inkers" 
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(comicSeriesData.metadata.letterers)"
							:comicMetadataDetailsLabel="'Letterers'" 
							:comicMetadataDetails="comicSeriesData.metadata.letterers" 
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(comicSeriesData.metadata.editors)"
							:comicMetadataDetailsLabel="'Editors'" 
							:comicMetadataDetails="comicSeriesData.metadata.editors" 
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Tabbed Comics Sections -->
		<TabView v-model:activeIndex="activeTab">
			<!-- Issues Tab -->
			<TabPanel header="Issues" value="issues">
				<div class="comic-series-page-contents">
					<!-- Header with view toggle buttons -->
					<div class="flex items-center justify-between mb-6">
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

					<!-- Loading State -->
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
								@click="navigateToComicBook(comic.id)"
							>
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
								<p class="text-sm font-semibold text-center">Issue {{ comic.issueNumber || 'Unknown' }}</p>
							</div>
						</div>
					</div>

					<!-- List View -->
					<div v-else-if="viewMode === 'list' && paginatedComics.length > 0" class="space-y-3">
						<div 
							v-for="(comic, index) in paginatedComics" 
							:key="index" 
							class="w-full flex items-start gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer border-l-4 border-cyan-800"
							@click="navigateToComicBook(comic.id)"
						>
							<!-- Thumbnail -->
							<div class="flex-shrink-0 w-24 h-32 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
								<img
									v-if="comic.thumbnailUrl"
									:src="`http://localhost:8000${comic.thumbnailUrl}`"
									:alt="`Issue ${comic.issueNumber}`"
									class="w-full h-full object-contain"
								/>
								<div v-else class="w-full h-full bg-gray-700 flex items-center justify-center">
									<span class="text-xs text-gray-500">No Image</span>
								</div>
							</div>
							
							<!-- Content -->
							<div class="flex-1">
								<div class="flex items-center justify-between">
									<div>
										<p class="font-semibold text-lg">Issue {{ comic.issueNumber || 'Unknown' }}</p>
										<p v-if="comic.title" class="text-sm text-gray-300 mt-1">{{ comic.title }}</p>
										<p class="text-sm text-gray-400 mt-2">Release Date: {{ comic.publicationDate || 'TBD' }} | Pages: {{ comic.pageCount || 'TBD' }}</p>
									</div>
									<div class="text-sm text-gray-400">
										Read Status: Unread
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Empty State -->
					<div v-else-if="!isLoading && paginatedComics.length === 0" class="text-center py-8">
						<p class="text-gray-500">No comics available for this series</p>
					</div>

					<!-- Pagination -->
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
			</TabPanel>

			<!-- Collections Tab -->
			<TabPanel header="Collections" value="collections">
				<div class="text-center py-8">
					<p class="text-gray-400">Collections will be displayed here</p>
				</div>
			</TabPanel>
		</TabView>
	</div>
</template>