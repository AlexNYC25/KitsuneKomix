<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

interface ComicReaderProps {
	comicBookId: number;
	comicTitle: string;
}

const props = defineProps<ComicReaderProps>();

const isVisible = ref(false);
const currentPage = ref(1);
const totalPages = ref(0);
const currentImageUrl = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const pageInfo = computed(() => `Page ${currentPage.value} of ${totalPages.value}`);
const isFirstPage = computed(() => currentPage.value === 1);
const isLastPage = computed(() => currentPage.value === totalPages.value);

const openReader = async () => {
	isVisible.value = true;
	await loadPageInfo();
	await loadPage(1);
};

const closeReader = () => {
	isVisible.value = false;
	currentPage.value = 1;
	currentImageUrl.value = null;
	error.value = null;
};

const loadPageInfo = async () => {
	try {
		const response = await fetch(`http://localhost:8000/api/comic-books/${props.comicBookId}/pages`, {
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('authToken')}`
			}
		});

		if (response.ok) {
			const data = await response.json();
            console.log(data)
			totalPages.value = data.totalPages || data.pagesInDb || 0;
		} else {
			error.value = 'Failed to load page information';
		}
	} catch (err) {
		console.error('Error loading page info:', err);
		error.value = 'Error loading page information';
	}
};

const loadPage = async (pageNumber: number) => {
	if (pageNumber < 1 || pageNumber > totalPages.value) {
		return;
	}

	isLoading.value = true;
	error.value = null;

	try {
		const response = await fetch(
			`http://localhost:8000/api/comic-books/${props.comicBookId}/stream/${pageNumber}`,
			{
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
					'Accept': 'image/webp,image/jpeg,image/*'
				}
			}
		);

		if (response.ok) {
			const data = await response.json();
			if (data.pagePath) {
				currentImageUrl.value = `http://localhost:8000/api/image/comic-book/${data.comicId}/page/${data.pagePath.split('/').pop()}`;
				currentPage.value = pageNumber;
			} else {
				error.value = 'Failed to load page';
			}
		} else {
			error.value = 'Failed to fetch page';
		}
	} catch (err) {
		console.error('Error loading page:', err);
		error.value = 'Error loading page';
	} finally {
		isLoading.value = false;
	}
};

const nextPage = () => {
	if (!isLastPage.value) {
		loadPage(currentPage.value + 1);
	}
};

const previousPage = () => {
	if (!isFirstPage.value) {
		loadPage(currentPage.value - 1);
	}
};

const goToPage = (pageNum: number) => {
	if (pageNum >= 1 && pageNum <= totalPages.value) {
		loadPage(pageNum);
	}
};

defineExpose({
	openReader
});
</script>

<template>
	<Dialog 
		v-model:visible="isVisible" 
		:header="comicTitle"
		:modal="true"
		:maximizable="true"
		:style="{ width: '95vw', height: '95vh' }"
		:breakpoints="{ '960px': '95vw', '640px': '95vw' }"
		class="comic-reader-dialog"
		@hide="closeReader"
	>
		<div class="comic-reader-container flex flex-col h-full">
			<!-- Error Message -->
			<div v-if="error" class="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
				{{ error }}
			</div>

			<!-- Main Content Area -->
			<div class="flex-1 flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden mb-4 min-h-0">
				<div v-if="isLoading" class="text-gray-400">
					<p>Loading page...</p>
				</div>
				<img 
					v-else-if="currentImageUrl"
					:src="currentImageUrl"
					:alt="`Page ${currentPage}`"
					class="max-w-full max-h-full object-contain"
				/>
				<div v-else class="text-gray-500">
					<p>No page loaded</p>
				</div>
			</div>

			<!-- Bottom Controls -->
			<div class="flex items-center justify-between gap-4 bg-gray-800 p-4 rounded-lg">
				<!-- Left Controls -->
				<div class="flex gap-2">
					<Button
						icon="pi pi-angle-double-left"
						:disabled="isFirstPage || isLoading"
						@click="goToPage(1)"
						v-tooltip="'First Page'"
						severity="secondary"
						size="small"
					/>
					<Button
						icon="pi pi-angle-left"
						:disabled="isFirstPage || isLoading"
						@click="previousPage"
						v-tooltip="'Previous Page'"
						severity="secondary"
						size="small"
					/>
				</div>

				<!-- Page Information and Slider -->
				<div class="flex-1 flex items-center gap-4">
					<span class="text-gray-400 whitespace-nowrap">{{ pageInfo }}</span>
					<input 
						type="range" 
						:min="1" 
						:max="totalPages" 
						:value="currentPage"
						@input="(e) => goToPage(parseInt((e.target as HTMLInputElement).value))"
						:disabled="isLoading"
						class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
					/>
				</div>

				<!-- Right Controls -->
				<div class="flex gap-2">
					<Button
						icon="pi pi-angle-right"
						:disabled="isLastPage || isLoading"
						@click="nextPage"
						v-tooltip="'Next Page'"
						severity="secondary"
						size="small"
					/>
					<Button
						icon="pi pi-angle-double-right"
						:disabled="isLastPage || isLoading"
						@click="goToPage(totalPages)"
						v-tooltip="'Last Page'"
						severity="secondary"
						size="small"
					/>
				</div>
			</div>
		</div>
	</Dialog>
</template>

<style scoped>
.comic-reader-container {
	min-height: 0;
}

:deep(.comic-reader-dialog .p-dialog-content) {
	padding: 1rem;
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 0;
}

input[type="range"] {
	-webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 1.25rem;
	height: 1.25rem;
	border-radius: 50%;
	background: #3b82f6;
	cursor: pointer;
	transition: background 0.2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
	background: #2563eb;
}

input[type="range"]::-moz-range-thumb {
	width: 1.25rem;
	height: 1.25rem;
	border-radius: 50%;
	background: #3b82f6;
	cursor: pointer;
	border: none;
	transition: background 0.2s;
}

input[type="range"]::-moz-range-thumb:hover {
	background: #2563eb;
}

input[type="range"]:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
