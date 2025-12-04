<script setup lang="ts">
import { ref, computed } from 'vue';
import { motion } from 'motion-v';
import Button from 'primevue/button';

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
const scrollDirection = ref<'vertical' | 'ltr' | 'rtl'>('ltr');
const showControls = ref(true);
const controlsTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const fitMode = ref<'height' | 'width'>('height');
const transitionDirection = ref<'left' | 'right' | null>(null);

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

	// In vertical mode: up/down arrows navigate pages
	if (scrollDirection.value === 'vertical') {
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
			<span class="text-gray-300 font-semibold">{{ comicTitle }}</span>
			<Button
				@click="closeReader"
				v-tooltip="'Close Reader'"
				severity="secondary"
				size="small"
				rounded
			>
				<v-icon name="io-close" />
			</Button>
		</div>

		<!-- Main Content Area -->
		<div class="flex-1 relative w-full overflow-hidden">
			<div 
				class="w-full h-full bg-black overflow-auto" 
				:class="fitMode === 'height' ? 'flex items-center justify-center' : ''" 
				data-comic-content
			>
				<motion.img
					v-if="currentImageUrl"
					:src="currentImageUrl"
					:alt="`Page ${currentPage}`"
					:initial="getInitialAnimationState()"
					:animate="{ x: 0, y: 0, opacity: 1 }"
					:transition="scrollDirection === 'vertical' ? { duration: 0.4, ease: 'easeInOut' } : { duration: 0.4, ease: 'easeInOut' }"
					:class="fitMode === 'height' ? 'max-w-full max-h-full object-contain' : 'w-full h-auto'"
					:key="currentPage"
				/>
				<div v-else-if="!isLoading" class="text-gray-500 flex items-center justify-center w-full h-full">
					<p>No page loaded</p>
				</div>
			</div>
		</div>

		<!-- Loading Indicator (Overlay) -->
		<div v-if="isLoading && !currentImageUrl" class="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
			<div class="text-gray-400 text-center">
				<p>Loading page...</p>
			</div>
		</div>

		<!-- Bottom Bar -->
		<div 
			class="bg-gray-800 border-t border-gray-700 p-4 transition-all duration-200 flex-shrink-0"
			:class="showControls ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden p-0'"
		>
			<div class="flex items-center justify-between gap-4">
				<!-- Page Slider -->
				<div class="flex-1 flex items-center gap-4">
					<span class="text-gray-400 whitespace-nowrap text-sm">{{ pageInfo }}</span>
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

				<!-- Navigation Buttons -->
				<div class="flex gap-2">
					<Button
						:disabled="isFirstPage || isLoading"
						@click="goToPage(1)"
						v-tooltip="'First Page'"
						severity="secondary"
						size="small"
					>
						<v-icon name="io-play-skip-back" />
					</Button>
					<Button
						:disabled="isFirstPage || isLoading"
						@click="previousPage"
						v-tooltip="'Previous Page'"
						severity="secondary"
						size="small"
					>
						<v-icon name="io-play-back" />
					</Button>
					<Button
						:disabled="isLastPage || isLoading"
						@click="nextPage"
						v-tooltip="'Next Page'"
						severity="secondary"
						size="small"
					>
						<v-icon name="io-play-forward" />
					</Button>
					<Button
						:disabled="isLastPage || isLoading"
						@click="goToPage(totalPages)"
						v-tooltip="'Last Page'"
						severity="secondary"
						size="small"
					>
						<v-icon name="io-play-skip-forward" />
					</Button>
				</div>

				<!-- Scroll Direction Options -->
				<div class="flex gap-2 ml-4 border-l border-gray-600 pl-4">
					<Button
						:pressed="scrollDirection === 'vertical'"
						@click="scrollDirection = 'vertical'"
						v-tooltip="'Vertical Scroll'"
						:severity="scrollDirection === 'vertical' ? 'info' : 'secondary'"
						size="small"
					>
						<v-icon name="io-caret-down-circle" />
					</Button>
					<Button
						:pressed="scrollDirection === 'ltr'"
						@click="scrollDirection = 'ltr'"
						v-tooltip="'Left to Right'"
						:severity="scrollDirection === 'ltr' ? 'info' : 'secondary'"
						size="small"
					>
						<v-icon name="io-caret-forward-circle" />
					</Button>
					<Button
						:pressed="scrollDirection === 'rtl'"
						@click="scrollDirection = 'rtl'"
						v-tooltip="'Right to Left'"
						:severity="scrollDirection === 'rtl' ? 'info' : 'secondary'"
						size="small"
					>
						<v-icon name="io-caret-back-circle" />
					</Button>
				</div>

				<!-- Fit Mode Options -->
				<div class="flex gap-2 ml-4 border-l border-gray-600 pl-4">
					<Button
						:pressed="fitMode === 'height'"
						@click="fitMode = 'height'"
						v-tooltip="'Fit Height'"
						:severity="fitMode === 'height' ? 'info' : 'secondary'"
						size="small"
					>
						<v-icon name="bi-arrows-expand" />
					</Button>
					<Button
						:pressed="fitMode === 'width'"
						@click="fitMode = 'width'"
						v-tooltip="'Fit Width (Zoom)'"
						:severity="fitMode === 'width' ? 'info' : 'secondary'"
						size="small"
					>
						<v-icon name="bi-arrows-collapse" />
					</Button>
				</div>
			</div>
		</div>
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
