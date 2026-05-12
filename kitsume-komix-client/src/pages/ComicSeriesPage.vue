<script setup lang="ts">
import { onMounted, ref, computed, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ComicSeriesPageDetails from '@/components/ComicSeriesPageDetails.vue';
import ComicThumbnail from '@/components/ComicThumbnail.vue';
import EmptyState from '@/components/states/EmptyState.vue';
import ErrorBoundary from '@/components/states/ErrorBoundary.vue';
import SkeletonPage from '@/components/states/SkeletonPage.vue';
import { getButtonClasses } from '@/composables/useButton';
import { useAuthStore } from '@/stores/auth';
import { useComicSeriesStore } from '@/stores/comic-series';
import type { ComicBook, ComicBooksSeriesResponse } from '@/types/comic-books.types';
import type { ComicSeriesResponseItem } from '@/types/comic-series.types';
import { apiClient } from '@/utilities/apiClient';
import { resolveImageSrc, revokeBlobUrls } from '@/utilities/image';
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

	try {
		const lookupResult = await comicSeriesStore.lookupComicSeriesById(idNum);
		if (lookupResult) {
			comicSeriesData.value = lookupResult;
		}
	} catch (error) {
		console.error('Error fetching comic series:', error);
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
const totalPages = computed(() => Math.ceil(totalComics.value / itemsPerPage));

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

const onPageChange = (page: number) => {
	currentPage.value = page;
};

const pageNumbers = computed(() => {
	const total = totalPages.value;
	const current = currentPage.value;
	if (total <= 7) {
		return Array.from({ length: total }, (_, i) => i);
	}

	const pages: number[] = [];
	pages.push(0);

	let start = Math.max(1, current - 2);
	let end = Math.min(total - 2, current + 2);

	if (current < 4) {
		end = Math.min(4, total - 2);
	} else if (current > total - 5) {
		start = Math.max(total - 5, 1);
	}

	if (start > 1) pages.push(-1);
	for (let i = start; i <= end; i++) pages.push(i);
	if (end < total - 2) pages.push(-1);

	pages.push(total - 1);
	return pages;
});

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
			<button :class="[getButtonClasses({}), 'active:scale-95 transition-transform duration-100']" @click="$router.back()">
        <v-icon name="io-arrow-back"/>
        Back
      </button>
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
			<div class="border-b border-surface-overlay">
				<div class="flex gap-0 -mb-px">
					<button
						@click="activeTab = 0"
						:class="[
							'px-4 py-3 text-sm font-medium transition-colors border-b-2',
							activeTab === 0
								? 'text-brand border-brand'
								: 'text-text-muted border-transparent hover:text-text-primary hover:border-surface-overlay'
						]"
					>
						Issues
					</button>
					<button
						@click="activeTab = 1"
						:class="[
							'px-4 py-3 text-sm font-medium transition-colors border-b-2',
							activeTab === 1
								? 'text-brand border-brand'
								: 'text-text-muted border-transparent hover:text-text-primary hover:border-surface-overlay'
						]"
					>
						Collections
					</button>
				</div>
			</div>

			<div v-if="activeTab === 0" class="comic-series-page-contents mt-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-2xl font-bold font-display text-text-primary">Comic Issues</h2>
					<div class="flex gap-2">
						<button
							@click="toggleViewMode('grid')"
							v-tooltip="'Grid View'"
							:class="getButtonClasses({ severity: viewMode === 'grid' ? 'info' : 'secondary', size: 'small' })"
						>
							<v-icon name="io-grid-outline"/>
						</button>
						<button
							@click="toggleViewMode('list')"
							v-tooltip="'List View'"
							:class="getButtonClasses({ severity: viewMode === 'list' ? 'info' : 'secondary', size: 'small' })"
						>
							<v-icon name="io-list"/>
						</button>
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
					<div v-if="totalComics > itemsPerPage" class="flex items-center justify-center gap-1 mt-6">
						<button
							:disabled="currentPage === 0"
							@click="onPageChange(0)"
							class="w-8 h-8 flex items-center justify-center rounded text-sm text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
						>
							<v-icon name="io-play-skip-back" />
						</button>
						<button
							:disabled="currentPage === 0"
							@click="onPageChange(currentPage - 1)"
							class="w-8 h-8 flex items-center justify-center rounded text-sm text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
						>
							<v-icon name="io-play-back" />
						</button>

						<template v-for="page in pageNumbers" :key="page">
							<span v-if="page === -1" class="w-8 h-8 flex items-center justify-center text-text-muted">…</span>
							<button
								v-else
								@click="onPageChange(page)"
								:class="[
									'w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors',
									page === currentPage
										? 'bg-brand text-white'
										: 'text-text-muted hover:text-text-primary hover:bg-surface-overlay'
								]"
							>
								{{ page + 1 }}
							</button>
						</template>

						<button
							:disabled="currentPage >= totalPages - 1"
							@click="onPageChange(currentPage + 1)"
							class="w-8 h-8 flex items-center justify-center rounded text-sm text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
						>
							<v-icon name="io-play-forward" />
						</button>
						<button
							:disabled="currentPage >= totalPages - 1"
							@click="onPageChange(totalPages - 1)"
							class="w-8 h-8 flex items-center justify-center rounded text-sm text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
						>
							<v-icon name="io-play-skip-forward" />
						</button>
					</div>
					<div v-else-if="totalComics > 0 && !isLoading" class="text-center text-text-muted mt-4">
						Showing all {{ totalComics }} comic issue(s)
					</div>
				</div>
			</div>

			<div v-if="activeTab === 1" class="mt-6">
				<div class="text-center py-8">
					<p class="text-text-muted">Collections will be displayed here</p>
				</div>
			</div>
		</ErrorBoundary>
	</div>
</template>

<style scoped>
</style>
