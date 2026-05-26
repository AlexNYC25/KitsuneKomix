<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { useGallerySort } from '@/composables/useGallerySort';
import { usePagination } from '@/composables/usePagination';
import { useComicBooksStore} from '@/stores/comic-books';

import GalleryToolbar from './gallery/GalleryToolbar.vue';
import GalleryFiltersPanel from './gallery/GalleryFiltersPanel.vue';
import GalleryBodyState from './gallery/GalleryBodyState.vue';
import GalleryPagination from './gallery/GalleryPagination.vue';

import type { ComicBook, ComicBooksFilterValuesData } from '@/types';

const comics = ref<ComicBook[]>([]);
const comicBooksStore = useComicBooksStore();

const showFilters = ref(false);
const filtersAllowed = ref<ComicBooksFilterValuesData | null>(null);
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);
const areThereActiveFilters = ref(false);
const activeFilterParams = ref<{ filterProperties: string[]; filterValues: string[] }>({
	filterProperties: [],
	filterValues: [],
});

const { isLatestRoute, sortCategory } = useGallerySort();

const pageSize = ref(20);

const {
	currentPage,
	displayTotalPages,
	hasNextPage,
	setPageResult,
	totalCount,
	visiblePages,
} = usePagination(pageSize);

const fetchPage = async (page: number) => {
	const { filterProperties, filterValues } = activeFilterParams.value;
	isLoading.value = true;
	errorMessage.value = null;

	try {
		const result = await comicBooksStore.fetchComicBookList(
			page,
			pageSize.value,
			sortCategory.value,
			filterProperties,
			filterValues,
		);
		comics.value = result.data;
		setPageResult(result.meta, page);
	} catch (error) {
		errorMessage.value = error instanceof Error ? error.message : 'Failed to load comic series';
	} finally {
		isLoading.value = false;
	}
}

const goToPage = (page: number) => {
	if (page >= 1 && page <= displayTotalPages.value) {
		fetchPage(page);
	}
};

watch(activeFilterParams, () => {
	fetchPage(1);
}, { deep: true });

watch(sortCategory, () => {
	fetchPage(1);
});

watch(pageSize, () => {
	fetchPage(1);
});


onMounted(() => {
	try {
		comicBooksStore.fetchComicBookFilterValues();
	} catch (error) {
		console.error('Failed to fetch comic books filter values:', error instanceof Error ? error.message : error);
	}
});

</script>

<template>
	<div class="w-full h-full flex flex-col bg-surface">
		<GalleryToolbar
			:areThereActiveFilters="areThereActiveFilters"
			:isLatestRoute="isLatestRoute"
			:pageSize="pageSize"
			:showFilters="showFilters"
			:sortCategory="sortCategory"
			:totalCount="totalCount"
			@update:pageSize="(value) => pageSize = value"
			@update:showFilters="(value) => showFilters = value"
			@update:sortCategory="(value) => sortCategory = value"
		/>

		<GalleryFiltersPanel
			:filtersAllowed="filtersAllowed"
			:showFilters="showFilters"
			@update:filterParams="(value) => activeFilterParams = value"
			@update:hasActiveFilters="(value) => areThereActiveFilters = value"
		/>

		<GalleryBodyState
			:errorMessage="errorMessage"
			:isEmpty="!isLoading && !errorMessage && comics.length === 0"
			:isLoading="isLoading"
			@retry="fetchPage(currentPage)"
		>
	
		</GalleryBodyState>

		<GalleryPagination
			:currentPage="currentPage"
			:displayTotalPages="displayTotalPages"
			:hasNextPage="hasNextPage"
			:pageSize="pageSize"
			:totalCount="totalCount"
			:visiblePages="visiblePages"
			@goToPage="goToPage"
		/>
	</div>
</template>