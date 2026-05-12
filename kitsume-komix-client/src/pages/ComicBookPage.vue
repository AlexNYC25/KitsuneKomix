<script setup lang="ts">
import Button from 'primevue/button';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';


import ComicReader from '@/components/ComicReader.vue';
import ComicSeriesPageDetails from '@/components/ComicSeriesPageDetails.vue';
import ComicThumbnail from '@/components/ComicThumbnail.vue';
import EmptyState from '@/components/states/EmptyState.vue';
import ErrorBoundary from '@/components/states/ErrorBoundary.vue';
import SkeletonPage from '@/components/states/SkeletonPage.vue';
import { useAuthStore } from '@/stores/auth';
import { useBreadcrumbStore } from '@/stores/breadcrumb';
import { useComicSeriesStore } from '@/stores/comic-series';
import type { ComicBookById, ComicBookMetadata, GetComicBookThumbnailsResponse, ComicBookThumbnailsData, ComicBookThumbnail, ComicBookReadlist, ComicBook } from '@/types/comic-books.types';
import { apiClient } from '@/utilities/apiClient';
import { convertArrayOfCreditsToString } from '@/utilities/formatting';
import { getThumbnailPathFromFilePath, buildComicDownloadUrl } from "@/utilities/urls";

const route = useRoute();
const router = useRouter();

const breadcrumbStore = useBreadcrumbStore();
const authStore = useAuthStore();
const comicSeriesStore = useComicSeriesStore();

const comicBookId = ref<number | null>(null);
const comicBookData = ref<ComicBookById | null>(null);
const comicBookMetadata = ref<ComicBookMetadata | null>(null);
const thumbnailUrl = ref<string | null>(null);
const comicBookListsData = ref<ComicBookReadlist[]>([]);

const comicReaderRef = ref<InstanceType<typeof ComicReader>>();
const isLoading = ref(true);
const activeTab = ref(0);
const isDownloading = ref(false);
const showAddListDialog = ref(false);
const listNameInput = ref('');

// Series comics for prev/next navigation
const seriesComics = ref<ComicBook[]>([]);
const seriesComicsLoading = ref(false);

onMounted(async () => {
	const id: string | string[] | undefined = route.params.id;
	const idStr: string | undefined = Array.isArray(id) ? id[0] : id;
	const idNum: number = parseInt(idStr, 10);

	if (isNaN(idNum)) {
		console.error('Invalid comic book ID');
		isLoading.value = false;
		return;
	}

	comicBookId.value = idNum;

	try {
		const { data: comicBookDetails, error: comicBookDetailsError } = await apiClient.GET('/comic-books/{id}', {
			params: {
				path: { id: String(idNum) }
			}
		});

		if (comicBookDetailsError) {
			console.error('Failed to fetch comic book data:', comicBookDetailsError);
		} else if (comicBookDetails) {
			comicBookData.value = comicBookDetails as ComicBookById;
			comicBookMetadata.value = comicBookDetails as ComicBookMetadata;

			const seriesId: number | undefined = route.query.seriesId ? parseInt(route.query.seriesId as string) : undefined;

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
					const thumbnails: ComicBookThumbnailsData = (thumbnailData as GetComicBookThumbnailsResponse).thumbnails;
					if (thumbnails && thumbnails.length > 0) {
						const firstThumbnail: ComicBookThumbnail = thumbnails[0];
						thumbnailUrl.value = getThumbnailPathFromFilePath(firstThumbnail.filePath.split('/').pop())
					}
				}
			} catch (error) {
				console.error('Error fetching thumbnail:', error);
			}

			// Fetch series comics for prev/next navigation
			if (seriesId) {
				void loadSeriesComics(seriesId, idNum);
			}
		}
	} catch (error) {
		console.error('Error fetching comic book:', error);
	} finally {
		isLoading.value = false;
	}
});

const loadSeriesComics = async (seriesId: number, currentComicId: number) => {
	seriesComicsLoading.value = true;
	try {
		const cached = comicSeriesStore.getComicsInSeries(seriesId);
		if (cached?.data?.length) {
			seriesComics.value = cached.data;
			return;
		}
		const response = await comicSeriesStore.fetchComicsInSeries(seriesId, 1, 100);
		seriesComics.value = response?.data ?? [];
	} catch (error) {
		console.error('Error fetching series comics for navigation:', error);
	} finally {
		seriesComicsLoading.value = false;
	}
};

const comicIssueNumberSorter = (a: ComicBook, b: ComicBook) => {
	if (!a.issueNumber || !b.issueNumber) return 0;
	return parseFloat(a.issueNumber) - parseFloat(b.issueNumber);
};

const sortedSeriesComics = computed(() => {
	return [...seriesComics.value].sort(comicIssueNumberSorter);
});

const currentIssueIndex = computed(() => {
	if (!comicBookId.value || !sortedSeriesComics.value.length) return -1;
	return sortedSeriesComics.value.findIndex(c => c.id === comicBookId.value);
});

const prevComic = computed(() => {
	if (currentIssueIndex.value <= 0) return null;
	return sortedSeriesComics.value[currentIssueIndex.value - 1] ?? null;
});

const nextComic = computed(() => {
	if (currentIssueIndex.value < 0 || currentIssueIndex.value >= sortedSeriesComics.value.length - 1) return null;
	return sortedSeriesComics.value[currentIssueIndex.value + 1] ?? null;
});

const navigateToComic = (comicId: number) => {
	const seriesId = route.query.seriesId as string | undefined;
	router.push(`/comic-book/${comicId}${seriesId ? `?seriesId=${seriesId}` : ''}`);
};

const openComicReader = () => {
	comicReaderRef.value?.openReader();
};

const comicBookHeading = computed(() => {
	if (comicBookData.value) {
		if (comicBookData.value.issueNumber && comicBookData.value.title) {
			return `Issue #${comicBookData.value.issueNumber} - ${comicBookData.value.title}`;
		}
		if (comicBookData.value.issueNumber) {
			return `Issue #${comicBookData.value.issueNumber}`;
		}
		return comicBookData.value.title || 'Comic Book';
	}
	return 'Comic Book';
});

const metadataDetailsSource = computed<Record<string, unknown> | null>(() => {
	const metadataValue = comicBookMetadata.value as (ComicBookMetadata & { credits?: Record<string, unknown> }) | null;
	if (metadataValue?.credits) {
		return metadataValue.credits;
	}

	if (metadataValue) {
		return metadataValue as unknown as Record<string, unknown>;
	}

	const comicData = comicBookData.value as (ComicBookById & { credits?: Record<string, unknown>; metadata?: Record<string, unknown> }) | null;
	return comicData?.credits ?? comicData?.metadata ?? null;
});

const metadataFieldToString = (field: string): string => {
	const fieldValue = metadataDetailsSource.value?.[field];

	if (!fieldValue) {
		return '';
	}

	if (typeof fieldValue === 'string') {
		return fieldValue;
	}

	if (Array.isArray(fieldValue)) {
		if (fieldValue.length === 0) {
			return '';
		}

		if (typeof fieldValue[0] === 'string') {
			return (fieldValue as string[]).join(', ');
		}

		return convertArrayOfCreditsToString(fieldValue as Array<{ name: string }>);
	}

	return '';
};

interface MetadataSectionField {
  key: string
  label: string
  maxVisible?: number
}

interface MetadataSection {
  title: string
  fields: MetadataSectionField[]
}

const METADATA_SECTIONS: MetadataSection[] = [
  {
    title: 'Credits',
    fields: [
      { key: 'writers', label: 'Writers' },
      { key: 'pencillers', label: 'Pencillers' },
      { key: 'inkers', label: 'Inkers' },
      { key: 'letterers', label: 'Letterers' },
      { key: 'colorists', label: 'Colorists' },
      { key: 'editors', label: 'Editors' },
      { key: 'coverArtists', label: 'Cover Artists' },
    ],
  },
  {
    title: 'Publishing',
    fields: [
      { key: 'publishers', label: 'Publishers' },
      { key: 'imprints', label: 'Imprints' },
    ],
  },
  {
    title: 'Content',
    fields: [
      { key: 'genres', label: 'Genres' },
      { key: 'characters', label: 'Characters', maxVisible: 8 },
      { key: 'teams', label: 'Teams' },
      { key: 'locations', label: 'Locations' },
      { key: 'storyArcs', label: 'Story Arcs' },
    ],
  },
  {
    title: 'Series Groups',
    fields: [
      { key: 'seriesGroups', label: 'Groups' },
    ],
  },
];

const metadataStrings = computed(() => {
  const result: Record<string, string> = {};
  for (const section of METADATA_SECTIONS) {
    for (const field of section.fields) {
      result[field.key] = metadataFieldToString(field.key);
    }
  }
  return result;
});

const visibleSections = computed(() => {
  return METADATA_SECTIONS
    .map(section => ({
      title: section.title,
      fields: section.fields.filter(f => metadataStrings.value[f.key].length > 0),
    }))
    .filter(section => section.fields.length > 0);
});

const setComicToRead = async (comicBookId: number) => {
	try {
		const { error } = await apiClient.POST('/comic-books/{id}/read', {
			params: {
				path: { id: String(comicBookId) }
			}
		});

		if (error) {
			console.error('Failed to mark comic as read:', error);
		}
	} catch (error) {
		console.error('Error marking comic as read:', error);
	}
};

const downloadComic = async (comicBookId: number) => {
	if (isDownloading.value) return;
	
	isDownloading.value = true;
	try {
		const response = await fetch(buildComicDownloadUrl(comicBookId), {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${authStore.token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Download failed: ${response.statusText}`);
		}

		const contentDisposition: string | null = response.headers.get('content-disposition');
		let filename: string = `comic-book-${comicBookId}`;
		
		if (contentDisposition) {
			const normalizedHeader: string = contentDisposition.replace(/[\n\r\t]+/g, ' ');
			
			let match: RegExpMatchArray | null = normalizedHeader.match(/filename="([^"]+)"/);
			if (match && match[1]) {
				filename = match[1];
			} else {
				match = normalizedHeader.match(/filename=([^;\s]+)/);
				if (match && match[1]) {
					filename = match[1].trim();
				}
			}
		}

		const blob: Blob = await response.blob();
		const url: string = window.URL.createObjectURL(blob);

		const link: HTMLAnchorElement = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		window.URL.revokeObjectURL(url);
	} catch (error) {
		console.error('Error downloading comic:', error);
	} finally {
		isDownloading.value = false;
	}
};

const formatFileSize = (bytes: number | null | undefined): string => {
	if (!bytes) return 'N/A';
	const mb = bytes / (1024 * 1024);
	return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
};
</script>

<template>
	<div class="comic-book-page flex flex-col w-full h-full p-4 overflow-auto">
		<div v-if="isLoading">
			<SkeletonPage layout="book" />
		</div>

		<div v-else-if="!comicBookData">
			<EmptyState
				icon="md-menubook-sharp"
				title="Comic Book Not Found"
				message="This comic book could not be loaded. It may have been removed or there was an error fetching the data."
			/>
		</div>

		<ErrorBoundary v-else>
		<div class="space-y-6">
			<!-- Header with Back and Issue Navigation -->
			<div class="flex items-center justify-between">
				<Button @click="$router.back()" class="active:scale-95 transition-transform duration-100">
					<v-icon name="io-arrow-back"/>
					Back
				</Button>
				<div class="flex items-center gap-2">
					<Button
						:disabled="!prevComic"
						@click="prevComic && navigateToComic(prevComic.id)"
						severity="secondary"
						size="small"
						class="active:scale-95 transition-transform"
					>
						<v-icon name="io-play-skip-back"/> Previous Issue
					</Button>
					<Button
						:disabled="!nextComic"
						@click="nextComic && navigateToComic(nextComic.id)"
						severity="secondary"
						size="small"
						class="active:scale-95 transition-transform"
					>
						Next Issue <v-icon name="io-play-skip-forward"/>
					</Button>
				</div>
			</div>

			<!-- Heading -->
			<h1 class="text-4xl font-bold font-display text-text-primary">{{ comicBookHeading }}</h1>

			<!-- Main Info Area: Thumbnail + Details -->
			<div class="flex flex-col md:flex-row gap-6 md:gap-8">
				<!-- Left: Thumbnail -->
				<div class="flex-shrink-0 flex justify-center md:block">
					<div class="w-48 sm:w-56 md:w-72">
						<ComicThumbnail :thumbnailUrl="thumbnailUrl || undefined"
							:comicName="comicBookData.title || `Comic Book #${comicBookId}`" />
					</div>
				</div>

				<!-- Right: Key Info Cards + Actions -->
				<div class="flex-1 space-y-4">
					<!-- Series -->
					<div v-if="comicBookData.series" class="flex items-center gap-2 text-lg">
						<v-icon name="io-library-sharp" class="text-brand text-xl"/>
						<span class="font-semibold text-text-primary">{{ comicBookData.series }}</span>
					</div>

					<!-- Key Info Cards Grid -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div class="bg-surface-elevated rounded-lg p-3 flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-brand/20 flex items-center justify-center flex-shrink-0">
								<v-icon name="io-book" class="text-brand"/>
							</div>
							<div>
								<p class="text-xs text-text-muted">Issue Number</p>
								<p class="font-semibold text-text-primary">#{{ comicBookData.issueNumber || 'N/A' }}</p>
							</div>
						</div>
						<div class="bg-surface-elevated rounded-lg p-3 flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-brand/20 flex items-center justify-center flex-shrink-0">
								<v-icon name="io-document" class="text-brand"/>
							</div>
							<div>
								<p class="text-xs text-text-muted">Pages</p>
								<p class="font-semibold text-text-primary">{{ comicBookData.pageCount || 'N/A' }}</p>
							</div>
						</div>
						<div class="bg-surface-elevated rounded-lg p-3 flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-brand/20 flex items-center justify-center flex-shrink-0">
								<v-icon name="io-document" class="text-brand"/>
							</div>
							<div>
								<p class="text-xs text-text-muted">File Size</p>
								<p class="font-semibold text-text-primary">{{ formatFileSize(comicBookData.fileSize) }}</p>
							</div>
						</div>
						<div class="bg-surface-elevated rounded-lg p-3 flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-brand/20 flex items-center justify-center flex-shrink-0">
								<v-icon name="io-library-sharp" class="text-brand"/>
							</div>
							<div>
								<p class="text-xs text-text-muted">Publisher</p>
								<p class="font-semibold text-text-primary">{{ comicBookData.publisher || 'N/A' }}</p>
							</div>
						</div>
						<div v-if="comicBookData.publicationDate" class="bg-surface-elevated rounded-lg p-3 flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-brand/20 flex items-center justify-center flex-shrink-0">
								<v-icon name="io-book" class="text-brand"/>
							</div>
							<div>
								<p class="text-xs text-text-muted">Release Date</p>
								<p class="font-semibold text-text-primary">{{ comicBookData.publicationDate }}</p>
							</div>
						</div>
					</div>

					<!-- Description -->
					<div v-if="comicBookData.summary" class="bg-surface-elevated rounded-lg p-4">
						<p class="text-xs text-text-muted mb-1">Description</p>
						<p class="text-text-primary text-sm leading-relaxed">{{ comicBookData.summary }}</p>
					</div>

					<!-- Actions -->
					<div class="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
						<Button class="w-full sm:flex-1 bg-brand border-brand text-white hover:brightness-110 active:scale-95 transition-all font-bold text-lg py-3" @click="openComicReader">
							<AppIcon name="book" /> Read Comic
						</Button>
						<div class="flex gap-2 sm:gap-3 w-full sm:w-auto">
							<Button severity="info" class="flex-1 sm:flex-none" @click="setComicToRead(comicBookData.id)">
								<AppIcon name="check" /> Mark Read
							</Button>
							<Button severity="secondary" class="flex-1 sm:flex-none" :disabled="isDownloading" :loading="isDownloading" @click="downloadComic(comicBookData.id)">
								<AppIcon name="download" /> Download
							</Button>
						</div>
					</div>
				</div>
			</div>

			<!-- Sectioned Metadata -->
			<div class="space-y-6">
				<template v-for="section in visibleSections" :key="section.title">
					<div class="border-l-4 border-brand pl-4 space-y-3">
						<h2 class="text-xl font-bold font-display text-text-primary">{{ section.title }}</h2>
						<div class="space-y-2">
							<ComicSeriesPageDetails
								v-for="field in section.fields"
								:key="field.key"
								:comicMetadataDetailsLabel="field.label"
								:comicMetadataDetails="metadataStrings[field.key]"
								:maxVisible="field.maxVisible"
							/>
						</div>
					</div>
				</template>
			</div>

			<!-- Tabbed Sections: Comic Pages + Lists -->
			<TabView v-model:activeIndex="activeTab">
				<TabPanel header="Comic Pages" value="pages">
					<div class="text-center py-8">
						<p class="text-text-muted">Comic pages will be displayed here</p>
					</div>
				</TabPanel>

				<TabPanel header="Lists" value="lists">
					<div v-if="comicBookListsData.length === 0" class="text-center py-8">
						<p class="text-text-muted mb-4">Comic is not part of any lists</p>
						<Button severity="success" @click="showAddListDialog = true">
							<AppIcon name="plus" /> Add Comic To List
						</Button>
					</div>
					<div v-else>
						<p class="text-text-muted">Lists will be displayed here</p>
					</div>
				</TabPanel>
			</TabView>

			<!-- Bottom Issue Navigation -->
			<div class="flex items-center justify-between pt-4 border-t border-surface-overlay">
				<Button
					:disabled="!prevComic"
					@click="prevComic && navigateToComic(prevComic.id)"
					severity="secondary"
					class="active:scale-95 transition-transform"
				>
					<v-icon name="io-play-skip-back"/> Previous Issue
				</Button>
				<span class="text-sm text-text-muted">
					Issue {{ comicBookData.issueNumber || '?' }} of {{ sortedSeriesComics.length || '?' }}
				</span>
				<Button
					:disabled="!nextComic"
					@click="nextComic && navigateToComic(nextComic.id)"
					severity="secondary"
					class="active:scale-95 transition-transform"
				>
					Next Issue <v-icon name="io-play-skip-forward"/>
				</Button>
			</div>

			<!-- Comic Reader Modal -->
			<ComicReader v-if="comicBookId && comicBookData" ref="comicReaderRef" :comicBookId="comicBookId"
				:comicTitle="comicBookHeading" :comicBookData="comicBookData" />

			<!-- Add Comic To List Dialog -->
			<div v-if="showAddListDialog" class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
				<div class="bg-surface-elevated rounded-lg p-6 w-full max-w-sm">
					<h2 class="text-2xl font-bold text-text-primary mb-4">Add Comic To List</h2>
					
					<div class="flex gap-2 mb-4">
						<input
							v-model="listNameInput"
							type="text"
							placeholder="Enter list name"
							class="flex-1 px-3 py-2 bg-surface-base border border-surface-overlay rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
						/>
						<Button @click="() => {}">
							<AppIcon name="plus" />
						</Button>
					</div>
					
					<div class="flex gap-2 justify-end">
						<Button label="Cancel" severity="secondary" @click="showAddListDialog = false; listNameInput = ''" />
					</div>
				</div>
			</div>
		</div>
		</ErrorBoundary>
	</div>
</template>

<style scoped></style>
