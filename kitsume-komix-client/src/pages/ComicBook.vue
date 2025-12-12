<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import { useBreadcrumbStore } from '@/stores/breadcrumb';
import { useAuthStore } from '@/stores/auth';
import { apiClient } from '@/utilities/apiClient';
import type { ComicBookMetadata } from '@/types/comic-books.types';

import ComicSeriesPageDetails from '../components/ComicSeriesPageDetails.vue';
import ComicReader from '../components/ComicReader.vue';
import ComicThumbnail from '../components/ComicThumbnail.vue';

const route = useRoute();

const breadcrumbStore = useBreadcrumbStore();
const authStore = useAuthStore();

const comicBookId = ref<number | null>(null);
const comicBookData = ref<ComicBookMetadata | null>(null);
const thumbnailUrl = ref<string | null>(null);

const comicReaderRef = ref<InstanceType<typeof ComicReader>>();
const isLoading = ref(true);
const activeTab = ref(0);

onMounted(async () => {
	const id = route.params.id;
	const idStr = Array.isArray(id) ? id[0] : id;
	const idNum = parseInt(idStr, 10);

	if (isNaN(idNum)) {
		console.error('Invalid comic book ID');
		isLoading.value = false;
		return;
	}

	comicBookId.value = idNum;

	// Fetch comic book metadata
	try {
		const { data, error } = await apiClient.GET('/comic-books/{id}/metadata', {
			params: {
				path: { id: String(idNum) }
			}
		});

		if (error) {
			console.error('Failed to fetch comic book data:', error);
		} else if (data) {
			comicBookData.value = data as ComicBookMetadata;

			// Get series ID from query params (passed from ComicSeries page)
			const seriesId = route.query.seriesId ? parseInt(route.query.seriesId as string) : undefined;

			// TODO: Migrat this to breadcrumb store action
			if (comicBookData.value) {
				breadcrumbStore.setComicBookData(
					seriesId,
					comicBookData.value.title || `Comic Book #${comicBookId.value}`
				);
			}

			// Fetch thumbnail
			try {
				const { data: thumbnailData, error: thumbnailError } = await apiClient.GET('/comic-books/{id}/thumbnails', {
					params: {
						path: { id: String(idNum) }
					}
				});

				if (!thumbnailError && thumbnailData) {
					const thumbnails = (thumbnailData as any).thumbnails;
					if (thumbnails && thumbnails.length > 0) {
						const firstThumbnail = thumbnails[0];
						thumbnailUrl.value = `/api/image/thumbnails/${firstThumbnail.file_path.split('/').pop()}`;
					}
				}
			} catch (error) {
				console.error('Error fetching thumbnail:', error);
			}
		}
	} catch (error) {
		console.error('Error fetching comic book:', error);
	} finally {
		isLoading.value = false;
	}
});

const openComicReader = () => {
	comicReaderRef.value?.openReader();
};

const comicBookHeading = computed(() => {
	if (comicBookData.value) {
		if (comicBookData.value.issueNumber && comicBookData.value.title) {
			return `Issue Number #${comicBookData.value.issueNumber} - ${comicBookData.value.title}`;
		}
		return `Issue Number #${comicBookData.value.issueNumber}`;
	}
	return 'Comic Book';
});

// Computed properties for metadata arrays with proper typing
// TODO: Refactor to a utility function to reduce redundancy
const writersString = computed(() => {
	const writers = comicBookData.value?.writers as Array<{ name: string }> | undefined;
	return writers?.map((w: { name: string }) => w.name).join(', ') ?? '';
});

const pencillersString = computed(() => {
	const pencillers = comicBookData.value?.pencillers as Array<{ name: string }> | undefined;
	return pencillers?.map((p: { name: string }) => p.name).join(', ') ?? '';
});

const inkersString = computed(() => {
	const inkers = comicBookData.value?.inkers as Array<{ name: string }> | undefined;
	return inkers?.map((i: { name: string }) => i.name).join(', ') ?? '';
});

const letterersString = computed(() => {
	const letterers = comicBookData.value?.letterers as Array<{ name: string }> | undefined;
	return letterers?.map((l: { name: string }) => l.name).join(', ') ?? '';
});

const coloristsString = computed(() => {
	const colorists = comicBookData.value?.colorists as Array<{ name: string }> | undefined;
	return colorists?.map((c: { name: string }) => c.name).join(', ') ?? '';
});

const editorsString = computed(() => {
	const editors = comicBookData.value?.editors as Array<{ name: string }> | undefined;
	return editors?.map((e: { name: string }) => e.name).join(', ') ?? '';
});

const coverArtistsString = computed(() => {
	const coverArtists = comicBookData.value?.coverArtists as Array<{ name: string }> | undefined;
	return coverArtists?.map((ca: { name: string }) => ca.name).join(', ') ?? '';
});

const publishersString = computed(() => {
	const publishers = comicBookData.value?.publishers as Array<{ name: string }> | undefined;
	return publishers?.map((p: { name: string }) => p.name).join(', ') ?? '';
});

const imprintsString = computed(() => {
	const imprints = comicBookData.value?.imprints as Array<{ name: string }> | undefined;
	return imprints?.map((i: { name: string }) => i.name).join(', ') ?? '';
});

const genresString = computed(() => {
	const genres = comicBookData.value?.genres as Array<{ name: string }> | undefined;
	return genres?.map((g: { name: string }) => g.name).join(', ') ?? '';
});

const charactersString = computed(() => {
	const characters = comicBookData.value?.characters as Array<{ name: string }> | undefined;
	return characters?.map((c: { name: string }) => c.name).join(', ') ?? '';
});

const teamsString = computed(() => {
	const teams = comicBookData.value?.teams as Array<{ name: string }> | undefined;
	return teams?.map((t: { name: string }) => t.name).join(', ') ?? '';
});

const locationsString = computed(() => {
	const locations = comicBookData.value?.locations as Array<{ name: string }> | undefined;
	return locations?.map((l: { name: string }) => l.name).join(', ') ?? '';
});

const storyArcsString = computed(() => {
	const storyArcs = comicBookData.value?.storyArcs as Array<{ name: string }> | undefined;
	return storyArcs?.map((sa: { name: string }) => sa.name).join(', ') ?? '';
});

const seriesGroupsString = computed(() => {
	const seriesGroups = comicBookData.value?.seriesGroups as Array<{ name: string }> | undefined;
	return seriesGroups?.map((sg: { name: string }) => sg.name).join(', ') ?? '';
});

// Function to mark comic as read
const setComicToRead = async (comicBookId: number) => {
	try {
		const { error } = await apiClient.POST('/comic-books/{id}/read', {
			params: {
				path: { id: String(comicBookId) },
				header: { authorization: 'Bearer ' }
			}
		});

		if (error) {
			console.error('Failed to mark comic as read:', error);
		}
	} catch (error) {
		console.error('Error marking comic as read:', error);
	}
};
</script>

<template>
	<div class="comic-book-page flex flex-col w-full h-full p-4 overflow-auto">
		<!-- Loading state -->
		<div v-if="isLoading" class="text-center py-8">
			<p class="text-gray-500">Loading comic book...</p>
		</div>

		<!-- Comic Book Content -->
		<div v-else-if="comicBookData" class="space-y-6">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<h1 class="text-4xl font-bold">{{ comicBookHeading }}</h1>
				<Button label="Back" icon="pi pi-arrow-left" @click="$router.back()" />
			</div>

			<!-- Comic Book Details with Thumbnail -->
			<div class="bg-gray-800 rounded-lg p-6 space-y-4">
				<div class="flex gap-6">
					<!-- Thumbnail -->
					<ComicThumbnail :thumbnailUrl="thumbnailUrl || undefined"
						:comicName="comicBookData.title || `Comic Book #${comicBookId}`" />

					<!-- Details -->
					<div class="flex-1">
						<!-- Series Info -->
						<div v-if="comicBookData.series" class="border-b border-gray-700 mb-4 pb-4">
							<p class="text-gray-400 text-sm mb-2">Series</p>
							<p class="text-lg font-semibold text-cyan-400">{{ comicBookData.series }}</p>
						</div>

						<!-- Basic Metadata -->
						<div class="grid grid-cols-2 gap-4">
							<div>
								<p class="text-gray-400 text-sm">Issue Number</p>
								<p class="text-lg font-semibold">{{ comicBookData.issueNumber || 'N/A' }}</p>
							</div>
							<div>
								<p class="text-gray-400 text-sm">Publication Date</p>
								<p class="text-lg font-semibold">{{ comicBookData.publicationDate || 'TBD' }}</p>
							</div>
							<div>
								<p class="text-gray-400 text-sm">Page Count</p>
								<p class="text-lg font-semibold">{{ comicBookData.pageCount || 'N/A' }} pages</p>
							</div>
							<div>
								<p class="text-gray-400 text-sm">File Size</p>
								<p class="text-lg font-semibold">{{ comicBookData.fileSize ? (comicBookData.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A' }}</p>
							</div>
							<div>
								<p class="text-gray-400 text-sm">File Path</p>
								<p class="text-sm text-gray-300 truncate">{{ comicBookData.filePath || 'N/A' }}</p>
							</div>
							
						</div>

						<div v-if="comicBookData.summary" class="border-t border-gray-700 mt-4 pt-4">
							<p class="text-gray-400 text-sm mb-2">Description</p>
							<p class="text-gray-300">{{ comicBookData.summary }}</p>
						</div>

						

						<!-- Actions -->
						<div class="flex gap-2 mt-6 border-t border-gray-700 pt-4">
							<Button label="Read Comic" icon="pi pi-book" severity="success" class="flex-1" @click="openComicReader" />
							<Button label="Mark as Read" icon="pi pi-check" severity="info" class="flex-1" @click="setComicToRead(comicBookData.id)" />
							<Button label="Download" icon="pi pi-download" severity="secondary" class="flex-1" />
						</div>
					</div>
				</div>
			</div>

			<!-- Tabbed Metadata Sections -->
			<TabView v-model:activeIndex="activeTab">
				<!-- Metadata Tab -->
				<TabPanel header="Metadata" value="metadata">
					<div class="space-y-4">
						<!-- Credits Section -->
						<div class="bg-gray-800 rounded-lg p-6 space-y-4">
							<h2 class="text-2xl font-bold border-b border-gray-700 pb-4">Credits</h2>
						<ComicSeriesPageDetails v-if="comicBookData.writers && comicBookData.writers.length > 0"
							comicMetadataDetailsLabel="Writers"
							:comicMetadataDetails="writersString" />
						<ComicSeriesPageDetails v-if="comicBookData.pencillers && comicBookData.pencillers.length > 0"
							comicMetadataDetailsLabel="Pencillers"
							:comicMetadataDetails="pencillersString" />
						<ComicSeriesPageDetails v-if="comicBookData.inkers && comicBookData.inkers.length > 0"
							comicMetadataDetailsLabel="Inkers"
							:comicMetadataDetails="inkersString" />
						<ComicSeriesPageDetails v-if="comicBookData.letterers && comicBookData.letterers.length > 0"
							comicMetadataDetailsLabel="Letterers"
							:comicMetadataDetails="letterersString" />
						<ComicSeriesPageDetails v-if="comicBookData.colorists && comicBookData.colorists.length > 0"
							comicMetadataDetailsLabel="Colorists"
							:comicMetadataDetails="coloristsString" />
						<ComicSeriesPageDetails v-if="comicBookData.editors && comicBookData.editors.length > 0"
							comicMetadataDetailsLabel="Editors"
							:comicMetadataDetails="editorsString" />
						<ComicSeriesPageDetails v-if="comicBookData.coverArtists && comicBookData.coverArtists.length > 0"
							comicMetadataDetailsLabel="Cover Artists"
							:comicMetadataDetails="coverArtistsString" />
						</div>

						<!-- Publishing Section -->
						<div class="bg-gray-800 rounded-lg p-6 space-y-4">
							<h2 class="text-2xl font-bold border-b border-gray-700 pb-4">Publishing</h2>
						<ComicSeriesPageDetails v-if="comicBookData.publishers && comicBookData.publishers.length > 0"
							comicMetadataDetailsLabel="Publishers"
							:comicMetadataDetails="publishersString" />
						<ComicSeriesPageDetails v-if="comicBookData.imprints && comicBookData.imprints.length > 0"
							comicMetadataDetailsLabel="Imprints"
							:comicMetadataDetails="imprintsString" />
						</div>

						<!-- Content Section -->
						<div class="bg-gray-800 rounded-lg p-6 space-y-4">
							<h2 class="text-2xl font-bold border-b border-gray-700 pb-4">Content</h2>
						<ComicSeriesPageDetails v-if="comicBookData.genres && comicBookData.genres.length > 0"
							comicMetadataDetailsLabel="Genres"
							:comicMetadataDetails="genresString" />
						<ComicSeriesPageDetails v-if="comicBookData.characters && comicBookData.characters.length > 0"
							comicMetadataDetailsLabel="Characters"
							:comicMetadataDetails="charactersString"
							:maxVisible="8" />
						<ComicSeriesPageDetails v-if="comicBookData.teams && comicBookData.teams.length > 0"
							comicMetadataDetailsLabel="Teams"
							:comicMetadataDetails="teamsString" />
						<ComicSeriesPageDetails v-if="comicBookData.locations && comicBookData.locations.length > 0"
							comicMetadataDetailsLabel="Locations"
							:comicMetadataDetails="locationsString" />
						<ComicSeriesPageDetails v-if="comicBookData.storyArcs && comicBookData.storyArcs.length > 0"
							comicMetadataDetailsLabel="Story Arcs"
							:comicMetadataDetails="storyArcsString" />
						</div>

						<!-- Series Groups Section -->
						<div v-if="comicBookData.seriesGroups && comicBookData.seriesGroups.length > 0"
							class="bg-gray-800 rounded-lg p-6 space-y-4">
							<h2 class="text-2xl font-bold border-b border-gray-700 pb-4">Series Groups</h2>
						<ComicSeriesPageDetails comicMetadataDetailsLabel="Groups"
							:comicMetadataDetails="seriesGroupsString" />
						</div>
					</div>
				</TabPanel>

				<!-- Comic Pages Tab -->
				<TabPanel header="Comic Pages" value="pages">
					<div class="text-center py-8">
						<p class="text-gray-400">Comic pages will be displayed here</p>
					</div>
				</TabPanel>

				<!-- Lists Tab -->
				<TabPanel header="Lists" value="lists">
					<div class="text-center py-8">
						<p class="text-gray-400">Lists will be displayed here</p>
					</div>
				</TabPanel>
			</TabView>

			<!-- Comic Reader Modal -->
			<ComicReader v-if="comicBookId && comicBookData" ref="comicReaderRef" :comicBookId="comicBookId"
				:comicTitle="comicBookHeading" :comicBookData="comicBookData" />
		</div>

		<!-- Error state -->
		<div v-else class="text-center py-8">
			<p class="text-red-500">Failed to load comic book</p>
		</div>
	</div>
</template>

<style scoped></style>
