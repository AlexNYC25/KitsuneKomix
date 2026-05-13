<script setup lang="ts">
/**
 * Full-screen comic book reader supporting single-page and webtoon modes.
 *
 * ## Features
 * - **Single-page mode** with LTR, RTL, and vertical scroll direction
 * - **Webtoon mode** — continuous vertical scroll of all pages
 * - **Keyboard navigation** — arrow keys, escape to close
 * - **Mouse navigation** — click zones on left/right/top/bottom edges
 * - **Progress persistence** — saves/restores reading position via localStorage
 * - **Continue prompt** — asks user to resume or start over
 * - **Motion animations** — page transitions via `motion-v`
 * - **Auto-hiding controls** — top/bottom bars hide after idle timeout
 * - **Fit modes** — fit-height (fit to viewport) and fit-width (scrollable)
 * - **Responsive** — adjusted click zones and layout on mobile
 *
 * @usage Expose `openReader()` via template ref to trigger from parent.
 *
 * @example
 * ```vue
 * <ComicReader ref="readerRef" :comic-book-id="42" comic-title="My Comic" />
 * ```
 */
import { motion } from 'motion-v';
import { ref, computed, onBeforeUnmount, watch } from 'vue';

import SkeletonBase from '@/components/states/SkeletonBase.vue';
import { getButtonClasses } from '@/composables/useButton';
import type { ComicReaderProps } from '@/types/comic-reader.types';
import { apiClient, composeStaticUrl } from '@/utilities/apiClient';
import { resolveImageSrc, revokeBlobUrl, revokeBlobUrls } from '@/utilities/image';


const props = defineProps<ComicReaderProps>();

/** Whether the reader overlay is currently open */
const isVisible = ref(false);

/** Current error message to display, or null */
const error = ref<string | null>(null);

// ---- Single-page mode state ----

/** Whether a page is currently being fetched */
const isLoading = ref(false);
/** The currently displayed page number (1-indexed) */
const currentPage = ref(1);
/** Total number of pages in the comic book */
const totalPages = ref(0);
/** Blob URL for the current page image */
const currentImageUrl = ref<string | null>(null);
/** Width percentage for fit-width mode (30-100) */
const singlePageImageWidth = ref(100);

// ---- Webtoon mode state ----

/** Whether webtoon pages are being loaded */
const isLoadingWebtoon = ref(false);
/** Array of all pages with their blob URLs for webtoon mode */
const webtoonPages = ref<{ pageNumber: number; imageUrl: string }[]>([]);
/** Width percentage for webtoon mode images */
const webtoonImageWidth = ref(100);

/** Whether the settings dialog is open */
const showSettings = ref(false);

// ---- Reader settings ----

/** How the image fits in the viewport: 'height' (fit) or 'width' (scrollable) */
const fitMode = ref<'height' | 'width'>('height');
/** Direction of the last page transition, used for animation */
const transitionDirection = ref<'left' | 'right' | null>(null);
/** Scroll direction for single-page navigation */
const scrollDirection = ref<'vertical' | 'ltr' | 'rtl'>('ltr');
/** Reading mode: single page at a time or continuous webtoon scroll */
const readingMode = ref<'single' | 'webtoon'>('single');

/** Whether the top/bottom control bars are visible */
const showControls = ref(true);
/** Timeout reference for auto-hiding controls */
const controlsTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// ---- Continue-reading prompt ----

/** Whether the "continue reading?" dialog is shown */
const showContinuePrompt = ref(false);
/** The page number where the user left off */
const savedProgressPage = ref(1);

const settingsDialogRef = ref<HTMLDialogElement | null>(null);
const continueDialogRef = ref<HTMLDialogElement | null>(null);

watch(showSettings, (val) => {
  const el = settingsDialogRef.value;
  if (!el) return;
  if (val) { el.showModal(); }
  else { el.close(); }
});

watch(showContinuePrompt, (val) => {
  const el = continueDialogRef.value;
  if (!el) return;
  if (val) { el.showModal(); }
  else { el.close(); }
});

const closeSettingsDialog = () => {
  showSettings.value = false;
};

// ---- Computed properties ----

/** Formatted page info string e.g. "Page 3 of 25" */
const pageInfo = computed(() => `Page ${currentPage.value} of ${totalPages.value}`);
/** Whether the reader is on the first page */
const isFirstPage = computed(() => currentPage.value === 1);
/** Whether the reader is on the last page */
const isLastPage = computed(() => currentPage.value === totalPages.value);

watch(currentPage, (newPage) => {
	if (isVisible.value && totalPages.value > 0) {
		const key = `kitsune-read-progress-${props.comicBookId}`;
		localStorage.setItem(key, JSON.stringify({
			page: newPage,
			timestamp: Date.now(),
			totalPages: totalPages.value
		}));
	}
});

const openReader = async () => {
	isVisible.value = true;
	await loadPageInfo();
	
	const key = `kitsune-read-progress-${props.comicBookId}`;
	const savedProgress = localStorage.getItem(key);
	
	if (savedProgress) {
		try {
			const parsed = JSON.parse(savedProgress);
			if (parsed.page > 1 && parsed.page <= totalPages.value) {
				savedProgressPage.value = parsed.page;
				showContinuePrompt.value = true;
			} else {
				localStorage.removeItem(key);
				await loadPage(1);
			}
		} catch (e) {
			localStorage.removeItem(key);
			await loadPage(1);
		}
	} else {
		await loadPage(1);
	}

	// Focus the container after page loads
	setTimeout(() => {
		const container = document.querySelector('[data-comic-reader]') as HTMLElement;
		if (container) container.focus();
	}, 0);
};

const startOver = () => {
	showContinuePrompt.value = false;
	localStorage.removeItem(`kitsune-read-progress-${props.comicBookId}`);
	loadPage(1);
};

const continueReading = () => {
	showContinuePrompt.value = false;
	loadPage(savedProgressPage.value);
};

const closeReader = () => {
	if (currentPage.value === totalPages.value && totalPages.value > 0) {
		localStorage.removeItem(`kitsune-read-progress-${props.comicBookId}`);
	}
	
	isVisible.value = false;
	showContinuePrompt.value = false;
	currentPage.value = 1;
	revokeBlobUrl(currentImageUrl.value || '');
	revokeBlobUrls(webtoonPages.value.map((page) => page.imageUrl));
	currentImageUrl.value = null;
	error.value = null;
	webtoonPages.value = [];
};

const loadPageInfo = async () => {
	try {
		const { data, error: pageInfoError } = await apiClient.GET('/comic-books/{id}/pages', {
			params: {
				path: {
					id: String(props.comicBookId)
				}
			}
		});

		if (pageInfoError || !data) {
			error.value = 'Failed to load page information';
			return;
		}

		totalPages.value = data.totalPages || data.pagesInDb || 0;
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
		const { data, error: streamError } = await apiClient.GET('/comic-books/{id}/stream/{page}', {
			params: {
				path: {
					id: String(props.comicBookId),
					page: String(pageNumber)
				}
			}
		});

		if (streamError || !data) {
			error.value = 'Failed to fetch page';
			return;
		}

		if (data.pagePath) {
			const pageFilename = data.pagePath.split('/').pop();
			const pageUrl = composeStaticUrl(`/api/image/comic-book/${data.comicId}/page/${pageFilename}`);
			const resolvedImageUrl = await resolveImageSrc(pageUrl);

			if (!resolvedImageUrl) {
				error.value = 'Failed to load page image';
				return;
			}

			revokeBlobUrl(currentImageUrl.value || '');
			
			currentImageUrl.value = resolvedImageUrl;
			currentPage.value = pageNumber;
		} else {
			error.value = 'Failed to load page';
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
	revokeBlobUrls(webtoonPages.value.map((page) => page.imageUrl));
	webtoonPages.value = [];
	error.value = null;

	try {
		for (let pageNum = 1; pageNum <= totalPages.value; pageNum++) {
			try {
				const { data, error: streamError } = await apiClient.GET('/comic-books/{id}/stream/{page}', {
					params: {
						path: {
							id: String(props.comicBookId),
							page: String(pageNum)
						}
					}
				});

				if (!streamError && data?.pagePath) {
					const pageFilename = data.pagePath.split('/').pop();
					const pageUrl = composeStaticUrl(`/api/image/comic-book/${data.comicId}/page/${pageFilename}`);
					const imageUrl = await resolveImageSrc(pageUrl);
					if (imageUrl) {
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

const isMobile = () => window.innerWidth < 768;
const controlsTimeoutDuration = () => isMobile() ? 1500 : 3000;

const resetControlsTimeout = () => {
	showControls.value = true;
	if (controlsTimeout.value) {
		clearTimeout(controlsTimeout.value);
	}
	controlsTimeout.value = setTimeout(() => {
		showControls.value = false;
	}, controlsTimeoutDuration());
};

const toggleControls = () => {
	showControls.value = !showControls.value;
	resetControlsTimeout();
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

onBeforeUnmount(() => {
	revokeBlobUrl(currentImageUrl.value || '');
	revokeBlobUrls(webtoonPages.value.map((page) => page.imageUrl));
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
		<!-- Reading Progress Bar -->
		<div 
			class="absolute top-0 left-0 h-[3px] bg-brand z-50 transition-all duration-300"
			:class="showControls ? 'opacity-100' : 'opacity-0'"
			:style="{ width: (totalPages > 0 ? (currentPage / totalPages) * 100 : 0) + '%' }"
		></div>

		<!-- Error Message -->
		<div v-if="error" class="bg-red-900 border-b border-red-700 text-red-100 px-4 py-3">
			{{ error }}
		</div>

		<!-- Top Bar -->
		<div 
			class="bg-black/60 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between transition-all duration-200 flex-shrink-0"
			:class="showControls ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden p-0'"
		>
			<span class="text-text-secondary font-semibold truncate mr-4">{{ (comicBookData && 'title' in comicBookData) ? comicBookData.title : 'Comic Reader' }}</span>

			<!-- Top Bar Buttons -->
			<div class="flex items-center gap-2">
				<!-- Inline Mode Buttons -->
				<div class="hidden md:flex items-center gap-1">
					<!-- Reading Mode -->
					<button
						@click="readingMode = 'single'"
						v-tooltip.bottom="generateTooltipDelay('Single Page Mode', 'medium')"
						:class="getButtonClasses({ severity: readingMode === 'single' ? 'info' : 'secondary', size: 'small', rounded: true })"
					>
						<v-icon name="io-book" />
					</button>
					<button
						@click="readingMode === 'single' ? (readingMode = 'webtoon', loadWebtoonPages()) : (readingMode = 'single')"
						v-tooltip.bottom="generateTooltipDelay('Webtoon Mode', 'medium')"
						:class="getButtonClasses({ severity: readingMode === 'webtoon' ? 'info' : 'secondary', size: 'small', rounded: true })"
					>
						<v-icon name="io-document" />
					</button>

					<div class="w-px h-6 bg-white/10 mx-1"></div>

					<!-- Scroll Direction (Single Mode Only) -->
					<template v-if="readingMode === 'single'">
						<button
							@click="scrollDirection = 'ltr'"
							v-tooltip.bottom="generateTooltipDelay('LTR', 'medium')"
							:class="getButtonClasses({ severity: scrollDirection === 'ltr' ? 'info' : 'secondary', size: 'small', rounded: true })"
						>
							<v-icon name="io-caret-forward-circle" />
						</button>
						<button
							@click="scrollDirection = 'rtl'"
							v-tooltip.bottom="generateTooltipDelay('RTL', 'medium')"
							:class="getButtonClasses({ severity: scrollDirection === 'rtl' ? 'info' : 'secondary', size: 'small', rounded: true })"
						>
							<v-icon name="io-caret-back-circle" />
						</button>
						<button
							@click="scrollDirection = 'vertical'"
							v-tooltip.bottom="generateTooltipDelay('Vertical', 'medium')"
							:class="getButtonClasses({ severity: scrollDirection === 'vertical' ? 'info' : 'secondary', size: 'small', rounded: true })"
						>
							<v-icon name="io-caret-down-circle" />
						</button>

						<div class="w-px h-6 bg-white/10 mx-1"></div>

						<!-- Fit Mode -->
						<button
							@click="fitMode = 'height'"
							v-tooltip.bottom="'Fit Height'"
							:class="getButtonClasses({ severity: fitMode === 'height' ? 'info' : 'secondary', size: 'small', rounded: true })"
						>
							<v-icon name="bi-arrows-expand" />
						</button>
						<button
							@click="fitMode = 'width'"
							v-tooltip.bottom="'Fit Width'"
							:class="getButtonClasses({ severity: fitMode === 'width' ? 'info' : 'secondary', size: 'small', rounded: true })"
						>
							<v-icon name="bi-arrows-collapse" />
						</button>

						<div class="w-px h-6 bg-white/10 mx-1"></div>
					</template>
				</div>

				<button
					@click="showSettings = true"
					v-tooltip.left="generateTooltipDelay('Reader Settings', 'medium')"
					:class="getButtonClasses({ severity: 'secondary', size: 'small', rounded: true })"
				>
					<v-icon name="io-settings-sharp" />
				</button>
				<button
					@click="closeReader"
					v-tooltip.left="generateTooltipDelay('Close Reader', 'medium')"
					:class="getButtonClasses({ severity: 'secondary', size: 'small', rounded: true })"
				>
					<v-icon name="io-close" />
				</button>
			</div>
		</div>

		<!-- Main Content Area -->
		<div class="flex-1 relative w-full overflow-hidden">
			<!-- Navigation Click Zones -->

			<!-- Horizontal Scroll Directions (LTR/RTL): Left/Right Zones -->
			<template v-if="readingMode === 'single' && scrollDirection !== 'vertical'">
				<!-- Left Click Zone (Previous Page) -->
				<div
					class="absolute left-0 top-0 w-1/4 md:w-1/12 h-full cursor-pointer hover:bg-white/5 transition-colors z-10 group flex items-center justify-center"
					@click="previousPage"
					:class="isFirstPage ? 'cursor-not-allowed' : ''"
				>
					<div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<v-icon name="io-play-skip-back" class="text-white/60 text-2xl md:text-3xl" />
					</div>
				</div>

				<!-- Center Zone (Toggle Controls) -->
				<div
					class="absolute left-1/4 md:left-1/12 right-1/4 md:right-1/12 top-0 h-full z-10"
					@click="toggleControls"
				></div>

				<!-- Right Click Zone (Next Page) -->
				<div
					class="absolute right-0 top-0 w-1/4 md:w-1/12 h-full cursor-pointer hover:bg-white/5 transition-colors z-10 group flex items-center justify-center"
					@click="nextPage"
					:class="isLastPage ? 'cursor-not-allowed' : ''"
				>
					<div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<v-icon name="io-play-skip-forward" class="text-white/60 text-2xl md:text-3xl" />
					</div>
				</div>
			</template>

			<!-- Vertical Scroll Direction: Top/Bottom Zones -->
			<template v-if="readingMode === 'single' && scrollDirection === 'vertical'">
				<!-- Top Click Zone (Previous Page) -->
				<div
					class="absolute top-0 left-0 w-full h-1/4 md:h-1/12 cursor-pointer hover:bg-white/5 transition-colors z-10 group flex items-center justify-center"
					@click="previousPage"
					:class="isFirstPage ? 'cursor-not-allowed' : ''"
				>
					<div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<v-icon name="io-caret-back-circle" class="text-white/60 text-2xl md:text-3xl rotate-90" />
					</div>
				</div>

				<!-- Center Zone (Toggle Controls) -->
				<div
					class="absolute top-1/4 md:top-1/12 bottom-1/4 md:bottom-1/12 left-0 w-full z-10"
					@click="toggleControls"
				></div>

				<!-- Bottom Click Zone (Next Page) -->
				<div
					class="absolute bottom-0 left-0 w-full h-1/4 md:h-1/12 cursor-pointer hover:bg-white/5 transition-colors z-10 group flex items-center justify-center"
					@click="nextPage"
					:class="isLastPage ? 'cursor-not-allowed' : ''"
				>
					<div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<v-icon name="io-caret-down-circle" class="text-white/60 text-2xl md:text-3xl" />
					</div>
				</div>
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
				<div v-else-if="!isLoading" class="text-text-muted flex items-center justify-center w-full h-full">
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
					<p class="text-text-muted">Loading webtoon mode...</p>
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
					<div v-if="webtoonPages.length === 0" class="text-text-muted flex items-center justify-center w-full h-full">
						<p>No pages loaded</p>
					</div>
				</template>
			</div>
		</div>

		<!-- Loading Indicator (Overlay) -->
		<div v-if="isLoading && !currentImageUrl" class="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
			<SkeletonBase width="60vh" height="90vh" />
		</div>

		<!-- Width Slider Bar (Appears when only in webtoon mode) -->
		<div 
			class="bg-black/60 backdrop-blur-sm border-t border-white/10 px-3 py-2 transition-all duration-200 flex-shrink-0"
			:class="showControls && readingMode === 'webtoon' ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden p-0'"
		>
			<div class="flex items-center gap-2 md:gap-4">
				<!-- Webtoon Width Slider -->
				<div v-if="readingMode === 'webtoon'" class="flex-1 flex items-center gap-2 md:gap-3">
					<span class="text-text-muted text-xs md:text-sm whitespace-nowrap">W:</span>
					<input 
						type="range" 
						:min="20" 
						:max="100" 
						:value="webtoonImageWidth"
						@input="(e) => webtoonImageWidth = parseInt((e.target as HTMLInputElement).value)"
						class="flex-1 h-2 bg-surface-overlay rounded-lg appearance-none cursor-pointer"
					/>
					<span class="text-text-muted text-xs md:text-sm whitespace-nowrap">{{ webtoonImageWidth }}%</span>
				</div>
			</div>
		</div>

		<!-- Bottom Bar -->
		<div 
			class="bg-black/60 backdrop-blur-sm border-t border-white/10 px-3 py-2 transition-all duration-200 flex-shrink-0"
			:class="showControls ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden p-0'"
		>
			<div v-if="readingMode === 'single'" class="flex items-center gap-2 md:gap-3">
				<!-- First Page Button -->
				<button
					:disabled="isFirstPage || isLoading"
					@click="goToPage(1)"
					v-tooltip.top="generateTooltipDelay('First Page', 'high')"
					:class="[getButtonClasses({ severity: 'secondary', size: 'small', disabled: isFirstPage || isLoading }), 'flex-shrink-0 active:scale-95 transition-transform duration-100']"
				>
					<v-icon name="io-play-skip-back" />
				</button>

				<!-- Previous Page Button -->
				<button
					:disabled="isFirstPage || isLoading"
					@click="previousPage"
					v-tooltip.top="generateTooltipDelay('Previous Page', 'high')"
					:class="[getButtonClasses({ severity: 'secondary', size: 'small', disabled: isFirstPage || isLoading }), 'flex-shrink-0 active:scale-95 transition-transform duration-100']"
				>
					<v-icon name="io-play-back" />
				</button>

				<!-- Page Slider -->
				<div class="flex-1 flex items-center gap-2">
					<span class="text-text-muted text-xs md:text-sm whitespace-nowrap">{{ pageInfo }}</span>
					<input 
						type="range" 
						:min="1" 
						:max="totalPages" 
						:value="currentPage"
						@input="(e) => goToPage(parseInt((e.target as HTMLInputElement).value))"
						:disabled="isLoading"
						class="flex-1 h-2 bg-surface-overlay rounded-lg appearance-none cursor-pointer"
					/>
				</div>

				<!-- Next Page Button -->
				<button
					:disabled="isLastPage || isLoading"
					@click="nextPage"
					v-tooltip.top="generateTooltipDelay('Next Page', 'high')"
					:class="[getButtonClasses({ severity: 'secondary', size: 'small', disabled: isLastPage || isLoading }), 'flex-shrink-0 active:scale-95 transition-transform duration-100']"
				>
					<v-icon name="io-play-forward" />
				</button>

				<!-- Last Page Button -->
				<button
					:disabled="isLastPage || isLoading"
					@click="goToPage(totalPages)"
					v-tooltip.top="generateTooltipDelay('Last Page', 'high')"
					:class="[getButtonClasses({ severity: 'secondary', size: 'small', disabled: isLastPage || isLoading }), 'flex-shrink-0 active:scale-95 transition-transform duration-100']"
				>
					<v-icon name="io-play-skip-forward" />
				</button>
			</div>
		</div>

		<!-- Continue Reading Prompt -->
		<dialog
			ref="continueDialogRef"
			class="fixed inset-0 z-50 m-auto w-[90vw] max-w-[400px] rounded-xl bg-surface-base shadow-elevated border border-surface-overlay backdrop:bg-black/50"
			@close="showContinuePrompt = false"
		>
			<div class="p-6">
				<h2 class="text-lg font-semibold text-text-primary mb-4">Continue Reading?</h2>
				<p class="text-text-secondary mb-4">
					You were on page {{ savedProgressPage }} of {{ totalPages }}. Continue where you left off?
				</p>
				<div class="flex justify-end gap-2">
					<button
						:class="getButtonClasses({ severity: 'secondary', size: 'small' })"
						@click="startOver"
					>
						Start Over
					</button>
					<button
						:class="getButtonClasses({ severity: 'primary', size: 'small' })"
						@click="continueReading"
					>
						Continue
					</button>
				</div>
			</div>
		</dialog>

		<!-- Settings Dialog -->
		<dialog
			ref="settingsDialogRef"
			class="fixed inset-0 z-50 m-auto rounded-xl bg-surface-base shadow-elevated border border-surface-overlay backdrop:bg-black/50 max-h-[90vh] overflow-y-auto"
			:class="isMobile() ? 'w-full h-full max-w-full max-h-full rounded-none border-0' : 'w-[90vw] max-w-[500px]'"
			@close="showSettings = false"
		>
			<div class="p-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-lg font-semibold text-text-primary">Reader Settings</h2>
					<button
						:class="getButtonClasses({ severity: 'secondary', size: 'small', rounded: true })"
						@click="closeSettingsDialog"
					>
						<v-icon name="io-close" />
					</button>
				</div>
				<div class="flex flex-col gap-4">
					<!-- Scroll Direction Section (Single Mode Only) -->
					<div v-if="readingMode === 'single'" class="flex flex-col gap-2">
						<h3 class="text-sm font-semibold text-text-secondary">Scroll Direction</h3>
						<div class="flex gap-2">
							<button
								@click="scrollDirection = 'vertical'"
								v-tooltip.top="generateTooltipDelay('Vertical', 'medium')"
								:class="[getButtonClasses({ severity: scrollDirection === 'vertical' ? 'info' : 'secondary', size: 'small' }), 'flex-1']"
							>
								<v-icon name="io-caret-down-circle" />
							</button>
							<button
								@click="scrollDirection = 'ltr'"
								v-tooltip.top="generateTooltipDelay('LTR', 'medium')"
								:class="[getButtonClasses({ severity: scrollDirection === 'ltr' ? 'info' : 'secondary', size: 'small' }), 'flex-1']"
							>
								<v-icon name="io-caret-forward-circle" />
							</button>
							<button
								@click="scrollDirection = 'rtl'"
								v-tooltip.top="generateTooltipDelay('RTL', 'medium')"
								:class="[getButtonClasses({ severity: scrollDirection === 'rtl' ? 'info' : 'secondary', size: 'small' }), 'flex-1']"
							>
								<v-icon name="io-caret-back-circle" />
							</button>
						</div>
					</div>

					<!-- Reading Mode Section -->
					<div class="flex flex-col gap-2 border-t border-surface-overlay pt-4">
						<h3 class="text-sm font-semibold text-text-secondary">Reading Mode</h3>
						<div class="flex gap-2">
							<button
								@click="readingMode = 'single'"
								v-tooltip.top="generateTooltipDelay('Single Page Mode', 'medium')"
								:class="[getButtonClasses({ severity: readingMode === 'single' ? 'info' : 'secondary', size: 'small' }), 'flex-1']"
							>
								<v-icon name="io-book" />
							</button>
							<button
								@click="readingMode === 'single' ? (readingMode = 'webtoon', loadWebtoonPages()) : (readingMode = 'single')"
								v-tooltip.top="generateTooltipDelay('Webtoon Mode', 'medium')"
								:class="[getButtonClasses({ severity: readingMode === 'webtoon' ? 'info' : 'secondary', size: 'small' }), 'flex-1']"
							>
								<v-icon name="io-document" />
							</button>
						</div>
					</div>

					<!-- Display Mode Section (Single Mode Only) -->
					<div v-if="readingMode === 'single'" class="flex flex-col gap-2 border-t border-surface-overlay pt-4">
						<h3 class="text-sm font-semibold text-text-secondary">Display Mode</h3>
						<p class="text-xs text-text-muted mb-2">
							{{ fitMode === 'height' ? 'Fit Height: Entire image visible in viewport' : 'Fit Width: Image fills width, scroll vertically' }}
						</p>
						<div class="flex gap-2">
							<button
								@click="fitMode = 'height'"
								v-tooltip.top="'Fit Height - Entire image visible'"
								:class="[getButtonClasses({ severity: fitMode === 'height' ? 'info' : 'secondary', size: 'small' }), 'flex-1']"
							>
								<v-icon name="bi-arrows-expand" />
							</button>
							<button
								@click="fitMode = 'width'"
								v-tooltip.top="'Fit Width - Scroll vertically'"
								:class="[getButtonClasses({ severity: fitMode === 'width' ? 'info' : 'secondary', size: 'small' }), 'flex-1']"
							>
								<v-icon name="bi-arrows-collapse" />
							</button>
						</div>
					</div>

					<!-- Zoom Slider Section (Single Mode Only) -->
					<div v-if="readingMode === 'single' && fitMode === 'width'" class="flex flex-col gap-2 border-t border-surface-overlay pt-4">
						<h3 class="text-sm font-semibold text-text-secondary">Zoom Level</h3>
						<div class="flex items-center gap-3">
							<span class="text-text-muted text-xs md:text-sm whitespace-nowrap">30%</span>
							<input 
								type="range" 
								:min="30" 
								:max="100" 
								:value="singlePageImageWidth"
								@input="(e) => singlePageImageWidth = parseInt((e.target as HTMLInputElement).value)"
								class="flex-1 h-2 bg-surface-overlay rounded-lg appearance-none cursor-pointer"
							/>
							<span class="text-text-muted text-xs md:text-sm whitespace-nowrap">{{ singlePageImageWidth }}%</span>
						</div>
					</div>
				</div>
			</div>
		</dialog>
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
	background: var(--color-surface-overlay);
	border-radius: 0.5rem;
	cursor: pointer;
	accent-color: var(--color-brand);
	-webkit-appearance: none;
	appearance: none;
}

input[type="range"]:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

input[type="range"]::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 1.25rem;
	height: 1.25rem;
	border-radius: 50%;
	background: var(--color-brand);
	cursor: pointer;
	transition: background 0.2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
	background: var(--color-brand-primary);
}

input[type="range"]::-moz-range-thumb {
	width: 1.25rem;
	height: 1.25rem;
	border-radius: 50%;
	background: var(--color-brand);
	cursor: pointer;
	border: none;
	transition: background 0.2s;
}

input[type="range"]::-moz-range-thumb:hover {
	background: var(--color-brand-primary);
}
</style>
