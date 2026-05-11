<script setup lang="ts">
import { onMounted, ref, computed, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { resolveImageSrc, revokeBlobUrls } from '@/utilities/image';
import { apiClient } from '@/utilities/apiClient';
import { useComicSeriesStore } from '@/stores/comic-series';
import type { ComicBook, ComicBooksSeriesResponse } from '@/types/comic-books.types';
import type { ComicSeriesResponseItem } from '@/types/comic-series.types';
import type { PageState } from 'primevue/paginator';
import ComicSeriesPageDetails from '@/components/ComicSeriesPageDetails.vue';
import Paginator from 'primevue/paginator';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import ComicThumbnail from '@/components/ComicThumbnail.vue';
import ErrorBoundary from '@/components/states/ErrorBoundary.vue';
import EmptyState from '@/components/states/EmptyState.vue';
import SkeletonPage from '@/components/states/SkeletonPage.vue';

import { getThumbnailPathFromFilePath } from "@/utilities/urls";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const comicSeriesStore = useComicSeriesStore();

const comicSeriesData = ref<ComicSeriesResponseItem | null>(null);
const comicsData = ref<ComicBooksSeriesResponse | null>(null);

const currentPage = ref(0);
const itemsPerPage = 25;
const viewMode = ref<'grid' | 'list'>('grid');
const isLoading = ref(true);
const activeTab = ref(0);
const comicThumbnailUrls = ref<Record<number, string>>({});

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

const allComicsInSeries = computed<ComicBook[]>(() => {
	return comicsData.value?.data ?? [];
});

const totalComics = computed(() => allComicsInSeries.value.length);

const comicIssueNumberSorter = (a: ComicBook, b: ComicBook) => {
	if (!a.issueNumber || !b.issueNumber) return 0;
	return parseFloat(a.issueNumber) - parseFloat(b.issueNumber);
}

const paginatedComics = computed(() => {
	if (!allComicsInSeries.value.length) return [];

	const sorted = [...allComicsInSeries.value].sort(comicIssueNumberSorter);

	const start = currentPage.value * itemsPerPage;
	const end = start + itemsPerPage;
	return sorted.slice(start, end);
});

const firstComicYear = computed(() => {
	if (!allComicsInSeries.value.length) return null;
	const sorted = [...allComicsInSeries.value].sort(comicIssueNumberSorter);
	return sorted[0]?.year || null;
});

const lastComicYear = computed(() => {
	if (!allComicsInSeries.value.length) return null;
	const sorted = [...allComicsInSeries.value].sort(comicIssueNumberSorter);
	return sorted[sorted.length - 1]?.year || null;
});

const yearRangeString = computed(() => {
	const first = firstComicYear.value;
	const last = lastComicYear.value;
	if (first && last && first !== last) return `${first}-${last}`;
	if (first) return String(first);
	return null;
});

const comicsByYear = computed(() => {
	const groups = new Map<number, ComicBook[]>();
	for (const comic of paginatedComics.value) {
		const year = comic.year ?? 0;
		if (!groups.has(year)) groups.set(year, []);
		groups.get(year)!.push(comic);
	}
	const sorted = [...groups.entries()].sort(([a], [b]) => b - a);
	return sorted;
});

const getComicThumbnailPath = (comic: ComicBook): string | null => {
	return getThumbnailPathFromFilePath(comic.thumbnails?.[0]?.filePath);
};

const revokeComicThumbnailUrls = () => {
	revokeBlobUrls(Object.values(comicThumbnailUrls.value));
	comicThumbnailUrls.value = {};
};

const loadComicThumbnails = async () => {
	revokeComicThumbnailUrls();

	const nextUrls: Record<number, string> = {};

	await Promise.all(
		allComicsInSeries.value.map(async (comic) => {
			let thumbnailPath = getComicThumbnailPath(comic);

			if (!thumbnailPath) {
				const { data } = await apiClient.GET('/comic-books/{id}/thumbnails', {
					params: {
						path: {
							id: String(comic.id)
						}
					}
				});

				thumbnailPath = getThumbnailPathFromFilePath(data?.thumbnails?.[0]?.filePath);
			}

			if (!thumbnailPath) {
				return;
			}

			const resolvedSrc = await resolveImageSrc(thumbnailPath);
			if (resolvedSrc) {
				nextUrls[comic.id] = resolvedSrc;
			}
		})
	);

	comicThumbnailUrls.value = nextUrls;
};

const getComicThumbnailUrl = (comic: ComicBook): string | null => {
	return comicThumbnailUrls.value[comic.id] ?? null;
};

const onPageChange = (event: PageState) => {
	currentPage.value = event.page;
};

const toggleViewMode = (mode: 'grid' | 'list') => {
	viewMode.value = mode;
	currentPage.value = 0;
};

const seriesDetailsSource = computed<Record<string, unknown> | null>(() => {
	if (!comicSeriesData.value) {
		return null;
	}

	const seriesData = comicSeriesData.value as ComicSeriesResponseItem & {
		credits?: Record<string, unknown>;
		metadata?: Record<string, unknown>;
	};

	return seriesData.credits ?? seriesData.metadata ?? null;
});

const toDetailsString = (value: unknown): string | undefined => {
	if (!value) {
		return undefined;
	}

	if (typeof value === 'string') {
		return value;
	}

	if (Array.isArray(value)) {
		const names = value
			.map((item) => {
				if (typeof item === 'string') {
					return item;
				}

				if (item && typeof item === 'object' && 'name' in item) {
					const name = (item as { name?: unknown }).name;
					return typeof name === 'string' ? name : '';
				}

				return '';
			})
			.filter((item) => item.length > 0);

		return names.length ? names.join(', ') : undefined;
	}

	return undefined;
};

const getSeriesDetails = (key: string): string | undefined => {
	return toDetailsString(seriesDetailsSource.value?.[key]);
};

const hasMetadata = (data: string | undefined): boolean => {
	return !!data && data.trim().length > 0;
};

const navigateToComicBook = (comicBookId: number) => {
	const seriesId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
	router.push(`/comic-book/${comicBookId}?seriesId=${seriesId}`);
};

watch(
	() => [allComicsInSeries.value, authStore.token],
	() => {
		void loadComicThumbnails();
	},
	{ immediate: true }
);

onBeforeUnmount(() => {
	revokeComicThumbnailUrls();
});

</script>

<template>
	<div class="comic-series-page flex flex-col w-full h-full p-4 overflow-auto">
		<div class="flex items-center justify-between mb-6">
			<Button @click="$router.back()" class="active:scale-95 transition-transform duration-100">
        <v-icon name="io-arrow-back"/>
        Back
      </Button>
		</div>

		<ErrorBoundary>
		<div class="bg-surface-elevated rounded-lg p-6 mb-6">
			<div class="flex gap-8">
				<div class="flex-shrink-0 relative">
					<ComicThumbnail :thumbnailUrl="comicSeriesData?.thumbnailUrl" :comicName="comicSeriesData?.name" />
					<div v-if="totalComics > 0" class="absolute top-2 right-2 bg-brand text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
						{{ totalComics }} {{ totalComics === 1 ? 'Issue' : 'Issues' }}<span v-if="yearRangeString"> · {{ yearRangeString }}</span>
					</div>
				</div>

				<div class="flex-1">
          <h1 class="text-4xl font-bold font-display text-text-primary">{{ comicSeriesData?.name || 'Series' }}</h1>

					<div v-if="comicSeriesData?.description" class="mb-4 mt-2">
						<p class="text-text-secondary text-sm mb-1">Description</p>
						<p class="text-text-primary">{{ comicSeriesData.description }}</p>
					</div>

					<div v-if="seriesDetailsSource" class="space-y-3 border-t border-surface-overlay pt-4">
						<ComicSeriesPageDetails 
							v-if="hasMetadata(getSeriesDetails('characters'))"
							:comicMetadataDetailsLabel="'Characters'" 
							:comicMetadataDetails="getSeriesDetails('characters')" 
							:maxVisible="5"
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(getSeriesDetails('teams'))"
							:comicMetadataDetailsLabel="'Teams'" 
							:comicMetadataDetails="getSeriesDetails('teams')" 
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(getSeriesDetails('writers'))"
							:comicMetadataDetailsLabel="'Writers'" 
							:comicMetadataDetails="getSeriesDetails('writers')" 
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(getSeriesDetails('colorists'))"
							:comicMetadataDetailsLabel="'Colorists'" 
							:comicMetadataDetails="getSeriesDetails('colorists')" 
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(getSeriesDetails('coverArtists'))"
							:comicMetadataDetailsLabel="'Cover Artists'" 
							:comicMetadataDetails="getSeriesDetails('coverArtists')" 
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(getSeriesDetails('inkers'))"
							:comicMetadataDetailsLabel="'Inkers'" 
							:comicMetadataDetails="getSeriesDetails('inkers')" 
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(getSeriesDetails('letterers'))"
							:comicMetadataDetailsLabel="'Letterers'" 
							:comicMetadataDetails="getSeriesDetails('letterers')" 
						/>
						<ComicSeriesPageDetails 
							v-if="hasMetadata(getSeriesDetails('editors'))"
							:comicMetadataDetailsLabel="'Editors'" 
							:comicMetadataDetails="getSeriesDetails('editors')" 
						/>
					</div>
				</div>
			</div>
		</div>
		</ErrorBoundary>

		<ErrorBoundary>
		<TabView v-model:activeIndex="activeTab">
			<TabPanel header="Issues" value="issues">
				<div class="comic-series-page-contents">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-2xl font-bold font-display text-text-primary">Comic Issues</h2>
						<div class="flex gap-2">
							<Button
								:severity="viewMode === 'grid' ? 'info' : 'secondary'"
								@click="toggleViewMode('grid')"
								v-tooltip="'Grid View'"
								size="small"
							>
                <v-icon name="io-grid-outline"/>
              </Button>
							<Button
								:severity="viewMode === 'list' ? 'info' : 'secondary'"
								@click="toggleViewMode('list')"
								v-tooltip="'List View'"
								size="small"
							>
                <v-icon name="io-list"/>
              </Button>
						</div>
					</div>

					<div v-if="isLoading">
						<SkeletonPage layout="series" />
					</div>

					<div v-else-if="paginatedComics.length === 0">
						<EmptyState
							icon="md-menubook-sharp"
							title="No Comics in This Series"
							message="No comic issues were found for this series. They may still be loading or the library may need to be re-scanned."
						/>
					</div>

					<div v-else-if="viewMode === 'grid'">
						<div v-for="[year, comics] in comicsByYear" :key="year">
							<div v-if="year > 0" class="flex items-center gap-3 mb-3 mt-6 first:mt-0">
								<span class="text-lg font-bold font-display text-brand tracking-wide">{{ year }}</span>
								<div class="flex-1 h-px bg-surface-overlay"></div>
							</div>
							<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
								<div 
									v-for="(comic, index) in comics" 
									:key="comic.id"
									:class="[
										'flex flex-col items-center gap-2 cursor-pointer group',
										index < 12 ? 'animate-fade-in-up' : ''
									]"
									:style="index < 12 ? { animationDelay: index * 50 + 'ms' } : {}"
									@click="navigateToComicBook(comic.id)"
								>
									<div class="w-full aspect-[3/4] bg-surface-base rounded-lg overflow-hidden flex items-center justify-center shadow-card transition-all duration-200 group-hover:scale-[1.03] group-hover:shadow-elevated relative">
										<img
											v-if="getComicThumbnailUrl(comic)"
											:src="getComicThumbnailUrl(comic) || undefined"
											:alt="`Issue ${comic.issueNumber}`"
											class="w-full h-full object-contain"
										/>
										<div v-else class="w-full h-full bg-surface-overlay flex items-center justify-center">
											<span class="text-text-muted">No Image</span>
										</div>
										<div class="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-surface-base bg-text-muted" title="Unread"></div>
									</div>
									<p class="text-sm font-semibold text-center text-text-primary">Issue {{ comic.issueNumber || 'Unknown' }}</p>
								</div>
							</div>
						</div>
					</div>

					<div v-else-if="viewMode === 'list' && paginatedComics.length > 0" class="space-y-2">
						<div class="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
							<div class="col-span-1"></div>
							<div class="col-span-2">Issue</div>
							<div class="col-span-4">Title</div>
							<div class="col-span-2">Year</div>
							<div class="col-span-2">Pages</div>
							<div class="col-span-1">Status</div>
						</div>
						<div 
							v-for="(comic, i) in paginatedComics" 
							:key="comic.id" 
							class="grid grid-cols-12 gap-4 items-center p-4 bg-surface-elevated rounded-lg hover:bg-surface-overlay transition-colors cursor-pointer border-l-4 border-brand/40 hover:border-brand"
							:class="{ 'bg-surface-base': i % 2 === 0 }"
							@click="navigateToComicBook(comic.id)"
						>
							<div class="col-span-1 w-10 h-14 bg-surface-base rounded overflow-hidden flex items-center justify-center">
								<img
									v-if="getComicThumbnailUrl(comic)"
									:src="getComicThumbnailUrl(comic) || undefined"
									:alt="`Issue ${comic.issueNumber}`"
									class="w-full h-full object-contain"
								/>
								<div v-else class="w-full h-full bg-surface-overlay flex items-center justify-center">
									<span class="text-xs text-text-muted">N/A</span>
								</div>
							</div>
							<div class="col-span-2 font-semibold text-text-primary">#{{ comic.issueNumber || 'Unknown' }}</div>
							<div class="col-span-4 text-text-secondary truncate">{{ comic.title || 'Untitled' }}</div>
							<div class="col-span-2 text-text-secondary">{{ comic.year || '—' }}</div>
							<div class="col-span-2 text-text-secondary">{{ comic.pageCount || '—' }}</div>
							<div class="col-span-1">
								<span class="inline-block w-2.5 h-2.5 rounded-full bg-text-muted" title="Unread"></span>
							</div>
						</div>
					</div>

					<div v-else-if="!isLoading && paginatedComics.length === 0" class="text-center py-8">
						<p class="text-text-muted">No comics available for this series</p>
					</div>

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
						<div v-else-if="totalComics > 0 && !isLoading" class="text-center text-text-muted mt-4">
							Showing all {{ totalComics }} comic issue(s)
						</div>
					</div>
				</div>
			</TabPanel>

			<TabPanel header="Collections" value="collections">
				<div class="text-center py-8">
					<p class="text-text-muted">Collections will be displayed here</p>
				</div>
			</TabPanel>
		</TabView>
		</ErrorBoundary>
	</div>
</template>

<style scoped>
:deep(.p-paginator .p-paginator-page-selected) {
  background: var(--color-brand) !important;
  border-color: var(--color-brand) !important;
}
:deep(.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  border-color: var(--color-brand) !important;
  color: var(--color-brand) !important;
}
</style>
