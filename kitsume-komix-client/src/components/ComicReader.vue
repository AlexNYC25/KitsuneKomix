<script setup lang="ts">
import { ref, computed } from 'vue';
import { motion } from 'motion-v';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Skeleton from 'primevue/skeleton';
import type { ComicBookMetadata } from '@/types/comic-books.types';

interface ComicReaderProps {
	comicBookId: number;
	comicTitle: string;
	comicBookData?: ComicBookMetadata;
}

const props = defineProps<ComicReaderProps>();

// Comic Reader top boolean, used to show/hide the reader
const isVisible = ref(false);

const error = ref<string | null>(null);

// single page mode state
const isLoading = ref(false);
const currentPage = ref(1);
const totalPages = ref(0);
const currentImageUrl = ref<string | null>(null);
const singlePageImageWidth = ref(100);

// webtoon mode state
const isLoadingWebtoon = ref(false);
const webtoonPages = ref<{ pageNumber: number; imageUrl: string }[]>([]);
const webtoonImageWidth = ref(100); // Width percentage for webtoon mode images

// show settings dialog
const showSettings = ref(false);

// actual reader settings
const fitMode = ref<'height' | 'width'>('height');
const transitionDirection = ref<'left' | 'right' | null>(null);
const scrollDirection = ref<'vertical' | 'ltr' | 'rtl'>('ltr');
const readingMode = ref<'single' | 'webtoon'>('single');

// used to show/hide controls displayed as the top and bottom bars
const showControls = ref(true);
const controlsTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// computed properties
const pageInfo = computed(() => `Page ${currentPage.value} of ${totalPages.value}`);
const isFirstPage = computed(() => currentPage.value === 1);
const isLastPage = computed(() => currentPage.value === totalPages.value);

const openReader = async () => {
	isVisible.value = true;
	await loadPageInfo();
	await loadPage(1);
	// Focus the container after page loads
	setTimeout(() => {
		const container = document.querySelector('[data-comic-reader]') as HTMLElement;
		if (container) container.focus();
	}, 0);
};

const closeReader = () => {
	isVisible.value = false;
	currentPage.value = 1;
	currentImageUrl.value = null;
	error.value = null;
	webtoonPages.value = [];
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

	// Determine transition direction BEFORE changing page
	if (pageNumber > currentPage.value) {
		transitionDirection.value = 'left';
	} else if (pageNumber < currentPage.value) {
		transitionDirection.value = 'right';
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
				const newImageUrl = `http://localhost:8000/api/image/comic-book/${data.comicId}/page/${data.pagePath.split('/').pop()}`;
				
				currentImageUrl.value = newImageUrl;
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

const getInitialAnimationState = () => {
	// Vertical mode: scroll up effect (slide from bottom)
	if (scrollDirection.value === 'vertical') {
		return { y: 100, opacity: 0 };
	}

	// LTR mode: normal direction
	if (scrollDirection.value === 'ltr') {
		if (transitionDirection.value === 'left') {
			// Going forward (next page) - slide in from right
			return { x: 100, opacity: 0 };
		} else {
			// Going backward (previous page) - slide in from left
			return { x: -100, opacity: 0 };
		}
	}

	// RTL mode: reversed direction
	if (scrollDirection.value === 'rtl') {
		if (transitionDirection.value === 'left') {
			// Going forward (next page) - slide in from left
			return { x: -100, opacity: 0 };
		} else {
			// Going backward (previous page) - slide in from right
			return { x: 100, opacity: 0 };
		}
	}

	return { opacity: 1, x: 0 };
};

const loadWebtoonPages = async () => {
	isLoadingWebtoon.value = true;
	webtoonPages.value = [];
	error.value = null;

	try {
		for (let pageNum = 1; pageNum <= totalPages.value; pageNum++) {
			try {
				const response = await fetch(
					`http://localhost:8000/api/comic-books/${props.comicBookId}/stream/${pageNum}`,
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
						const imageUrl = `http://localhost:8000/api/image/comic-book/${data.comicId}/page/${data.pagePath.split('/').pop()}`;
						webtoonPages.value.push({ pageNumber: pageNum, imageUrl });
					}
				}
			} catch (err) {
				console.error(`Error loading webtoon page ${pageNum}:`, err);
			}
		}
	} catch (err) {
		console.error('Error loading webtoon mode:', err);
		error.value = 'Error loading webtoon mode';
	} finally {
		isLoadingWebtoon.value = false;
	}
};

const resetControlsTimeout = () => {
	showControls.value = true;
	if (controlsTimeout.value) {
		clearTimeout(controlsTimeout.value);
	}
	controlsTimeout.value = setTimeout(() => {
		showControls.value = false;
	}, 3000);
};

const handleMouseMove = () => {
	resetControlsTimeout();
};

const handleKeyDown = (event: KeyboardEvent) => {
	const contentArea = document.querySelector('[data-comic-content]') as HTMLElement;
	if (!contentArea) return;

	const scrollAmount = 50;

	// In webtoon mode: up/down arrows scroll
	if (readingMode.value === 'webtoon') {
		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				contentArea.scrollTop -= scrollAmount;
				break;
			case 'ArrowDown':
				event.preventDefault();
				contentArea.scrollTop += scrollAmount;
				break;
			case 'Escape':
				event.preventDefault();
				closeReader();
				break;
		}
	}
	// In vertical mode: up/down arrows navigate pages
	else if (scrollDirection.value === 'vertical') {
		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				previousPage();
				break;
			case 'ArrowDown':
				event.preventDefault();
				nextPage();
				break;
			case 'Escape':
				event.preventDefault();
				closeReader();
				break;
		}
	} else {
		// In horizontal modes (ltr/rtl): left/right navigate pages, up/down scroll
		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				contentArea.scrollTop -= scrollAmount;
				break;
			case 'ArrowDown':
				event.preventDefault();
				contentArea.scrollTop += scrollAmount;
				break;
			case 'ArrowLeft':
				event.preventDefault();
				previousPage();
				break;
			case 'ArrowRight':
				event.preventDefault();
				nextPage();
				break;
			case 'Escape':
				event.preventDefault();
				closeReader();
				break;
		}
	}
};

defineExpose({
	openReader
});

// Utilities
const generateTooltipDelay = (msg: string, type: 'low' | 'medium' | 'high'): { value: string; showDelay: number } => {
	let delay = 500;
	switch (type) {
		case 'low':
			delay = 500;
			break;
		case 'medium':
			delay = 750;
			break;
		case 'high':
			delay = 1000;
			break;
	}
	return { value: msg, showDelay: delay };
}
</script>

<template>
	<div 
		v-if="isVisible"
		class="fixed inset-0 bg-black z-50 flex flex-col outline-none"
		@mousemove="handleMouseMove"
		@keydown="handleKeyDown"
		tabindex="0"
		autofocus
		data-comic-reader
	>
		<!-- Error Message -->
		<div v-if="error" class="bg-red-900 border-b border-red-700 text-red-100 px-4 py-3">
			{{ error }}
		</div>

		<!-- Top Bar -->
		<div 
			class="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between transition-all duration-200 flex-shrink-0"
			:class="showControls ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden p-0'"
		>
			<span class="text-gray-300 font-semibold">{{ comicBookData?.title || 'Comic Reader' }}</span>

			<!-- Top Bar Buttons -->
			<div class="flex gap-2">
				<Button
					@click="showSettings = true"
					v-tooltip.left="generateTooltipDelay('Reader Settings', 'medium')"
					severity="secondary"
					size="small"
					rounded
				>
					<v-icon name="io-settings-sharp" />
				</Button>
				<Button
					@click="closeReader"
					v-tooltip.left="generateTooltipDelay('Close Reader', 'medium')"
					severity="secondary"
					size="small"
					rounded
				>
					<v-icon name="io-close" />
				</Button>
			</div>
		</div>

		<!-- Main Content Area -->
		<div class="flex-1 relative w-full overflow-hidden">
			<!-- Navigation Click Zones -->

			<!-- Horizontal Scroll Directions (LTR/RTL): Left/Right Zones -->
			<template v-if="readingMode === 'single' && scrollDirection !== 'vertical'">
				<!-- Left Click Zone (Previous Page) -->
				<div
					class="absolute left-0 top-0 w-1/12 h-full cursor-pointer hover:bg-white/5 transition-colors z-10"
					@click="previousPage"
					:class="isFirstPage ? 'cursor-not-allowed' : ''"
				/>

				<!-- Right Click Zone (Next Page) -->
				<div
					class="absolute right-0 top-0 w-1/12 h-full cursor-pointer hover:bg-white/5 transition-colors z-10"
					@click="nextPage"
					:class="isLastPage ? 'cursor-not-allowed' : ''"
				/>
			</template>

			<!-- Vertical Scroll Direction: Top/Bottom Zones -->
			<template v-if="readingMode === 'single' && scrollDirection === 'vertical'">
				<!-- Top Click Zone (Previous Page) -->
				<div
					class="absolute top-0 left-0 w-full h-1/12 cursor-pointer hover:bg-white/5 transition-colors z-10"
					@click="previousPage"
					:class="isFirstPage ? 'cursor-not-allowed' : ''"
				/>

				<!-- Bottom Click Zone (Next Page) -->
				<div
					class="absolute bottom-0 left-0 w-full h-1/12 cursor-pointer hover:bg-white/5 transition-colors z-10"
					@click="nextPage"
					:class="isLastPage ? 'cursor-not-allowed' : ''"
				/>
			</template>

			<!-- Single Page Mode -->
			<div 
				v-if="readingMode === 'single'"
				class="w-full h-full bg-black overflow-auto" 
				:class="fitMode === 'height' ? 'flex items-center justify-center' : ''" 
				data-comic-content
			>
				<div v-if="fitMode === 'width'" class="w-full flex justify-center py-4">
					<motion.img
						v-if="currentImageUrl"
						:src="currentImageUrl"
						:alt="`Page ${currentPage}`"
						:initial="getInitialAnimationState()"
						:animate="{ x: 0, y: 0, opacity: 1 }"
						:transition="scrollDirection === 'vertical' ? { duration: 0.4, ease: 'easeInOut' } : { duration: 0.4, ease: 'easeInOut' }"
						class="object-contain"
						:style="{ width: `${singlePageImageWidth}%`, height: 'auto' }"
						:key="currentPage"
					/>
				</div>
				<motion.img
					v-else-if="currentImageUrl"
					:src="currentImageUrl"
					:alt="`Page ${currentPage}`"
					:initial="getInitialAnimationState()"
					:animate="{ x: 0, y: 0, opacity: 1 }"
					:transition="scrollDirection === 'vertical' ? { duration: 0.4, ease: 'easeInOut' } : { duration: 0.4, ease: 'easeInOut' }"
					class="max-w-full max-h-full object-contain"
					:key="currentPage"
				/>
				<div v-else-if="!isLoading" class="text-gray-500 flex items-center justify-center w-full h-full">
					<p>No page loaded</p>
				</div>
			</div>

			<!-- Webtoon Mode -->
			<div
				v-else
				class="w-full h-full bg-black overflow-auto flex flex-col items-center py-4"
				data-comic-content
			>
				<div v-if="isLoadingWebtoon" class="flex items-center justify-center w-full h-full">
					<p class="text-gray-400">Loading webtoon mode...</p>
				</div>
				<template v-else>
					<motion.img
						v-for="page in webtoonPages"
						:key="`webtoon-${page.pageNumber}`"
						:src="page.imageUrl"
						:alt="`Page ${page.pageNumber}`"
						:initial="{ opacity: 0 }"
						:animate="{ opacity: 1 }"
						:transition="{ duration: 0.3, ease: 'easeInOut' }"
						:style="{ width: `${webtoonImageWidth}%` }"
						class="mb-4 object-contain"
					/>
					<div v-if="webtoonPages.length === 0" class="text-gray-500 flex items-center justify-center w-full h-full">
						<p>No pages loaded</p>
					</div>
				</template>
			</div>
		</div>

		<!-- Loading Indicator (Overlay) -->
		<div v-if="isLoading && !currentImageUrl" class="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
			<Skeleton width="60vh" height="90vh" />
		</div>

		<!-- Width Slider Bar (Appears when only in webtoon mode) -->
		<div 
			class="bg-gray-800 border-t border-gray-700 px-3 py-2 transition-all duration-200 flex-shrink-0"
			:class="showControls && readingMode === 'webtoon' ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden p-0'"
		>
			<div class="flex items-center gap-2 md:gap-4">
				<!-- Webtoon Width Slider -->
				<div v-if="readingMode === 'webtoon'" class="flex-1 flex items-center gap-2 md:gap-3">
					<span class="text-gray-400 text-xs md:text-sm whitespace-nowrap">W:</span>
					<input 
						type="range" 
						:min="20" 
						:max="100" 
						:value="webtoonImageWidth"
						@input="(e) => webtoonImageWidth = parseInt((e.target as HTMLInputElement).value)"
						class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
					/>
					<span class="text-gray-400 text-xs md:text-sm whitespace-nowrap">{{ webtoonImageWidth }}%</span>
				</div>
			</div>
		</div>

		<!-- Bottom Bar -->
		<div 
			class="bg-gray-800 border-t border-gray-700 px-3 py-2 transition-all duration-200 flex-shrink-0"
			:class="showControls ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden p-0'"
		>
			<div v-if="readingMode === 'single'" class="flex items-center gap-2 md:gap-3">
				<!-- First Page Button -->
				<Button
					:disabled="isFirstPage || isLoading"
					@click="goToPage(1)"
					v-tooltip.top="generateTooltipDelay('First Page', 'high')"
					severity="secondary"
					size="small"
					class="flex-shrink-0"
				>
					<v-icon name="io-play-skip-back" />
				</Button>

				<!-- Previous Page Button -->
				<Button
					:disabled="isFirstPage || isLoading"
					@click="previousPage"
					v-tooltip.top="generateTooltipDelay('Previous Page', 'high')"
					severity="secondary"
					size="small"
					class="flex-shrink-0"
				>
					<v-icon name="io-play-back" />
				</Button>

				<!-- Page Slider -->
				<div class="flex-1 flex items-center gap-2">
					<span class="text-gray-400 text-xs md:text-sm whitespace-nowrap">{{ pageInfo }}</span>
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

				<!-- Next Page Button -->
				<Button
					:disabled="isLastPage || isLoading"
					@click="nextPage"
					v-tooltip.top="generateTooltipDelay('Next Page', 'high')"
					severity="secondary"
					size="small"
					class="flex-shrink-0"
				>
					<v-icon name="io-play-forward" />
				</Button>

				<!-- Last Page Button -->
				<Button
					:disabled="isLastPage || isLoading"
					@click="goToPage(totalPages)"
					v-tooltip.top="generateTooltipDelay('Last Page', 'high')"
					severity="secondary"
					size="small"
					class="flex-shrink-0"
				>
					<v-icon name="io-play-skip-forward" />
				</Button>
			</div>
		</div>

		<!-- Settings Dialog -->
		<Dialog
			v-model:visible="showSettings"
			modal
			header="Reader Settings"
			:style="{ width: '90vw', maxWidth: '500px' }"
			class="p-dialog-header-light"
		>
			<div class="flex flex-col gap-4">
				<!-- Scroll Direction Section (Single Mode Only) -->
				<div v-if="readingMode === 'single'" class="flex flex-col gap-2">
					<h3 class="text-sm font-semibold text-gray-300">Scroll Direction</h3>
					<div class="flex gap-2">
						<Button
							:pressed="scrollDirection === 'vertical'"
							@click="scrollDirection = 'vertical'"
							v-tooltip.top="generateTooltipDelay('Vertical', 'medium')"
							:severity="scrollDirection === 'vertical' ? 'info' : 'secondary'"
							size="small"
							class="flex-1"
						>
							<v-icon name="io-caret-down-circle" />
						</Button>
						<Button
							:pressed="scrollDirection === 'ltr'"
							@click="scrollDirection = 'ltr'"
							v-tooltip.top="generateTooltipDelay('LTR', 'medium')"
							:severity="scrollDirection === 'ltr' ? 'info' : 'secondary'"
							size="small"
							class="flex-1"
						>
							<v-icon name="io-caret-forward-circle" />
						</Button>
						<Button
							:pressed="scrollDirection === 'rtl'"
							@click="scrollDirection = 'rtl'"
							v-tooltip.top="generateTooltipDelay('RTL', 'medium')"
							:severity="scrollDirection === 'rtl' ? 'info' : 'secondary'"
							size="small"
							class="flex-1"
						>
							<v-icon name="io-caret-back-circle" />
						</Button>
					</div>
				</div>

				<!-- Reading Mode Section -->
				<div class="flex flex-col gap-2 border-t border-gray-600 pt-4">
					<h3 class="text-sm font-semibold text-gray-300">Reading Mode</h3>
					<div class="flex gap-2">
						<Button
							:pressed="readingMode === 'single'"
							@click="readingMode = 'single'"
							v-tooltip.top="generateTooltipDelay('Single Page Mode', 'medium')"
							:severity="readingMode === 'single' ? 'info' : 'secondary'"
							size="small"
							class="flex-1"
						>
							<v-icon name="io-book" />
						</Button>
						<Button
							:pressed="readingMode === 'webtoon'"
							@click="readingMode === 'single' ? (readingMode = 'webtoon', loadWebtoonPages()) : (readingMode = 'single')"
							v-tooltip.top="generateTooltipDelay('Webtoon Mode', 'medium')"
							:severity="readingMode === 'webtoon' ? 'info' : 'secondary'"
							size="small"
							class="flex-1"
						>
							<v-icon name="io-document" />
						</Button>
					</div>
				</div>

				<!-- Display Mode Section (Single Mode Only) -->
				<div v-if="readingMode === 'single'" class="flex flex-col gap-2 border-t border-gray-600 pt-4">
					<h3 class="text-sm font-semibold text-gray-300">Display Mode</h3>
					<p class="text-xs text-gray-400 mb-2">
						{{ fitMode === 'height' ? 'Fit Height: Entire image visible in viewport' : 'Fit Width: Image fills width, scroll vertically' }}
					</p>
					<div class="flex gap-2">
						<Button
							:pressed="fitMode === 'height'"
							@click="fitMode = 'height'"
							v-tooltip.top="'Fit Height - Entire image visible'"
							:severity="fitMode === 'height' ? 'info' : 'secondary'"
							size="small"
							class="flex-1"
						>
							<v-icon name="bi-arrows-expand" />
						</Button>
						<Button
							:pressed="fitMode === 'width'"
							@click="fitMode = 'width'"
							v-tooltip.top="'Fit Width - Scroll vertically'"
							:severity="fitMode === 'width' ? 'info' : 'secondary'"
							size="small"
							class="flex-1"
						>
							<v-icon name="bi-arrows-collapse" />
						</Button>
					</div>
				</div>

				<!-- Zoom Slider Section (Single Mode Only) -->
				<div v-if="readingMode === 'single' && fitMode === 'width'" class="flex flex-col gap-2 border-t border-gray-600 pt-4">
					<h3 class="text-sm font-semibold text-gray-300">Zoom Level</h3>
					<div class="flex items-center gap-3">
						<span class="text-gray-400 text-xs md:text-sm whitespace-nowrap">30%</span>
						<input 
							type="range" 
							:min="30" 
							:max="100" 
							:value="singlePageImageWidth"
							@input="(e) => singlePageImageWidth = parseInt((e.target as HTMLInputElement).value)"
							class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
						/>
						<span class="text-gray-400 text-xs md:text-sm whitespace-nowrap">{{ singlePageImageWidth }}%</span>
					</div>
				</div>
			</div>
		</Dialog>
	</div>
</template>

<style scoped>
/* Remove focus outline */
div[tabindex]:focus {
	outline: none;
}

/* Range input styling */
input[type="range"] {
	width: 100%;
	height: 0.5rem;
	background: #374151;
	border-radius: 0.5rem;
	cursor: pointer;
	accent-color: #3b82f6;
	-webkit-appearance: none;
	appearance: none;
}

input[type="range"]:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* Webkit browsers (Chrome, Safari, Edge) */
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

/* Firefox */
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
</style>
