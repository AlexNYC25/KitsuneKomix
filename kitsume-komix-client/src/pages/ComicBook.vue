<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import ComicSeriesPageDetails from '../components/ComicSeriesPageDetails.vue';
import ComicReader from '../components/ComicReader.vue';
import { useBreadcrumbStore } from '@/stores/breadcrumb';

const route = useRoute();
const breadcrumbStore = useBreadcrumbStore();
const comicReaderRef = ref<InstanceType<typeof ComicReader>>();
const comicBookId = ref<number | null>(null);
const comicBookData = ref<any | null>(null);
const thumbnailUrl = ref<string | null>(null);
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

	try {
		const response = await fetch(`http://localhost:8000/api/comic-books/${idNum}/metadata`, {
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('authToken')}`
			}
		});

		if (response.ok) {
			comicBookData.value = await response.json();

			// Get series ID from query params (passed from ComicSeries page)
			const seriesId = route.query.seriesId ? parseInt(route.query.seriesId as string) : undefined;

			breadcrumbStore.setComicBookData(
				seriesId,
				comicBookData.value.title || `Comic Book #${comicBookId.value}`
			);
			console.log('Breadcrumb store after update:', {
				seriesId: breadcrumbStore.comicBookSeriesId,
				title: breadcrumbStore.comicBookTitle
			})

			// Fetch thumbnail
			try {
				const thumbnailResponse = await fetch(`http://localhost:8000/api/comic-books/${idNum}/thumbnails`, {
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('authToken')}`
					}
				});

				if (thumbnailResponse.ok) {
					const thumbnailData = await thumbnailResponse.json();
					if (thumbnailData.thumbnails && thumbnailData.thumbnails.length > 0) {
						const firstThumbnail = thumbnailData.thumbnails[0];
						thumbnailUrl.value = `/api/image/thumbnails/${firstThumbnail.file_path.split('/').pop()}`;
					}
				}
			} catch (error) {
				console.error('Error fetching thumbnail:', error);
			}
		} else {
			console.error('Failed to fetch comic book data');
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
				<h1 class="text-4xl font-bold">{{ comicBookData.title || `Comic Book #${comicBookId}` }}</h1>
				<Button label="Back" icon="pi pi-arrow-left" @click="$router.back()" />
			</div>

			<!-- Comic Book Details with Thumbnail -->
			<div class="bg-gray-800 rounded-lg p-6 space-y-4">
				<div class="flex gap-6">
					<!-- Thumbnail -->
					<div class="flex-shrink-0 w-80 h-auto">
						<div class="aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
							<img
								v-if="thumbnailUrl"
								:src="`http://localhost:8000${thumbnailUrl}`"
								:alt="comicBookData.title || 'Comic Book Thumbnail'"
								class="w-full h-full object-contain"
							/>
							<div v-else class="w-full h-full bg-gray-700 flex items-center justify-center">
								<span class="text-gray-500">No Image</span>
							</div>
						</div>
					</div>

					<!-- Details -->
					<div class="flex-1">
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
								<p class="text-gray-400 text-sm">File Path</p>
								<p class="text-sm text-gray-300 truncate">{{ comicBookData.filePath || 'N/A' }}</p>
							</div>
						</div>

						<div v-if="comicBookData.description" class="border-t border-gray-700 mt-4 pt-4">
							<p class="text-gray-400 text-sm mb-2">Description</p>
							<p class="text-gray-300">{{ comicBookData.description }}</p>
						</div>

						<!-- Series Info -->
						<div v-if="comicBookData.series" class="border-t border-gray-700 mt-4 pt-4">
							<p class="text-gray-400 text-sm mb-2">Series</p>
							<p class="text-lg font-semibold text-cyan-400">{{ comicBookData.series }}</p>
						</div>

						<!-- Actions -->
						<div class="flex gap-2 mt-6 border-t border-gray-700 pt-4">
							<Button 
								label="Read Comic" 
								icon="pi pi-book" 
								severity="success" 
								class="flex-1"
								@click="openComicReader"
							/>
							<Button label="Mark as Read" icon="pi pi-check" severity="info" class="flex-1" />
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
							<ComicSeriesPageDetails
								v-if="comicBookData.writers && comicBookData.writers.length > 0"
								comicMetadataDetailsLabel="Writers"
								:comicMetadataDetails="comicBookData.writers.map((w: any) => w.name || w).join(', ')"
							/>
							<ComicSeriesPageDetails
								v-if="comicBookData.pencillers && comicBookData.pencillers.length > 0"
								comicMetadataDetailsLabel="Pencillers"
								:comicMetadataDetails="comicBookData.pencillers.map((p: any) => p.name || p).join(', ')"
							/>
							<ComicSeriesPageDetails
								v-if="comicBookData.inkers && comicBookData.inkers.length > 0"
								comicMetadataDetailsLabel="Inkers"
								:comicMetadataDetails="comicBookData.inkers.map((i: any) => i.name || i).join(', ')"
							/>
							<ComicSeriesPageDetails
								v-if="comicBookData.letterers && comicBookData.letterers.length > 0"
								comicMetadataDetailsLabel="Letterers"
								:comicMetadataDetails="comicBookData.letterers.map((l: any) => l.name || l).join(', ')"
							/>
							<ComicSeriesPageDetails
								v-if="comicBookData.colorists && comicBookData.colorists.length > 0"
								comicMetadataDetailsLabel="Colorists"
								:comicMetadataDetails="comicBookData.colorists.map((c: any) => c.name || c).join(', ')"
							/>
							<ComicSeriesPageDetails
								v-if="comicBookData.editors && comicBookData.editors.length > 0"
								comicMetadataDetailsLabel="Editors"
								:comicMetadataDetails="comicBookData.editors.map((e: any) => e.name || e).join(', ')"
							/>
							<ComicSeriesPageDetails
								v-if="comicBookData.coverArtists && comicBookData.coverArtists.length > 0"
								comicMetadataDetailsLabel="Cover Artists"
								:comicMetadataDetails="comicBookData.coverArtists.map((ca: any) => ca.name || ca).join(', ')"
							/>
						</div>

						<!-- Publishing Section -->
						<div class="bg-gray-800 rounded-lg p-6 space-y-4">
							<h2 class="text-2xl font-bold border-b border-gray-700 pb-4">Publishing</h2>
							<ComicSeriesPageDetails
								v-if="comicBookData.publishers && comicBookData.publishers.length > 0"
								comicMetadataDetailsLabel="Publishers"
								:comicMetadataDetails="comicBookData.publishers.map((p: any) => p.name || p).join(', ')"
							/>
							<ComicSeriesPageDetails
								v-if="comicBookData.imprints && comicBookData.imprints.length > 0"
								comicMetadataDetailsLabel="Imprints"
								:comicMetadataDetails="comicBookData.imprints.map((i: any) => i.name || i).join(', ')"
							/>
						</div>

						<!-- Content Section -->
						<div class="bg-gray-800 rounded-lg p-6 space-y-4">
							<h2 class="text-2xl font-bold border-b border-gray-700 pb-4">Content</h2>
							<ComicSeriesPageDetails
								v-if="comicBookData.genres && comicBookData.genres.length > 0"
								comicMetadataDetailsLabel="Genres"
								:comicMetadataDetails="comicBookData.genres.map((g: any) => g.name || g).join(', ')"
							/>
							<ComicSeriesPageDetails
								v-if="comicBookData.characters && comicBookData.characters.length > 0"
								comicMetadataDetailsLabel="Characters"
								:comicMetadataDetails="comicBookData.characters.map((c: any) => c.name || c).join(', ')"
								:maxVisible="8"
							/>
							<ComicSeriesPageDetails
								v-if="comicBookData.teams && comicBookData.teams.length > 0"
								comicMetadataDetailsLabel="Teams"
								:comicMetadataDetails="comicBookData.teams.map((t: any) => t.name || t).join(', ')"
							/>
							<ComicSeriesPageDetails
								v-if="comicBookData.locations && comicBookData.locations.length > 0"
								comicMetadataDetailsLabel="Locations"
								:comicMetadataDetails="comicBookData.locations.map((l: any) => l.name || l).join(', ')"
							/>
							<ComicSeriesPageDetails
								v-if="comicBookData.storyArcs && comicBookData.storyArcs.length > 0"
								comicMetadataDetailsLabel="Story Arcs"
								:comicMetadataDetails="comicBookData.storyArcs.map((sa: any) => sa.name || sa).join(', ')"
							/>
						</div>

						<!-- Series Groups Section -->
						<div v-if="comicBookData.seriesGroups && comicBookData.seriesGroups.length > 0" class="bg-gray-800 rounded-lg p-6 space-y-4">
							<h2 class="text-2xl font-bold border-b border-gray-700 pb-4">Series Groups</h2>
							<ComicSeriesPageDetails
								comicMetadataDetailsLabel="Groups"
								:comicMetadataDetails="comicBookData.seriesGroups.map((sg: any) => sg.name || sg).join(', ')"
							/>
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
			<ComicReader 
				v-if="comicBookId && comicBookData"
				ref="comicReaderRef"
				:comicBookId="comicBookId"
				:comicTitle="comicBookData.title"
			/>
		</div>

		<!-- Error state -->
		<div v-else class="text-center py-8">
			<p class="text-red-500">Failed to load comic book</p>
		</div>
	</div>
</template>

<style scoped>
</style>
