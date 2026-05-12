<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getButtonClasses } from '@/composables/useButton'
import { useTheme } from '@/composables/useTheme'
import { useBreadcrumbStore } from '@/stores/breadcrumb'
import { useComicSeriesStore } from '@/stores/comic-series'

const emit = defineEmits<{ toggleSidebar: [] }>()
const { isDark, toggle: toggleTheme } = useTheme()
const route = useRoute()
const comicSeriesStore = useComicSeriesStore()
const breadcrumbStore = useBreadcrumbStore()

const breadcrumbItems = ref<{label: string, icon: string, to: string}[]>([])

const getComicSeriesName = async (seriesId: number): Promise<string> => {
	try {
		const seriesArr = await comicSeriesStore.lookupComicSeriesById(seriesId)
		return seriesArr && seriesArr.comicBooks && seriesArr?.comicBooks.length > 0 ? seriesArr.name : 'Comic Series'
	} catch (error) {
		console.error('Failed to fetch series name:', error)
	}
	return 'Comic Series'
}

const generateBreadcrumbs = async () => {
	const items: {label: string, icon: string, to: string}[] = [
		{
			label: 'Home',
			icon: 'home',
			to: '/'
		}
	]

	if (route.path.includes('/comic-series')) {
		const seriesId = parseInt(route.params.id as string)
		if (!isNaN(seriesId)) {
			const seriesName = await getComicSeriesName(seriesId)
			items.push({
				label: seriesName,
				icon: 'book',
				to: `/comic-series/${seriesId}`
			})
		}
	}

	if (route.path.includes('/comic-book')) {
		const bookId = parseInt(route.params.id as string)
		if (!isNaN(bookId)) {
			// Use the series ID from breadcrumb store if available
			const seriesId = breadcrumbStore.comicBookSeriesId
			
			if (seriesId) {
				const seriesName = await getComicSeriesName(seriesId)
				items.push({
					label: seriesName,
					icon: 'book',
					to: `/comic-series/${seriesId}`
				})
			}

			items.push({
				label: breadcrumbStore.comicBookTitle || 'Comic Book',
				icon: 'image',
				to: `/comic-book/${bookId}`
			})
		}
	}

	breadcrumbItems.value = items
}

// Watch route changes and breadcrumb store changes
watch([() => route.path, () => breadcrumbStore.comicBookSeriesId, () => breadcrumbStore.comicBookTitle], () => {
	generateBreadcrumbs()
}, { immediate: true })
</script>

<template>
	<header class="bg-surface-elevated border-b border-surface-overlay">
		<div class="flex justify-between items-center gap-4 p-4">
			<div id="top-bar-left" class="flex items-center gap-2 flex-grow min-w-0">
				<button
					:class="[getButtonClasses({ severity: 'info', text: true, rounded: true }), 'md:!hidden !p-2 !min-w-0 flex-shrink-0']"
					@click="emit('toggleSidebar')"
				>
					<AppIcon name="bars" />
				</button>
				<nav aria-label="breadcrumb">
					<ol class="flex items-center gap-1 text-sm min-w-0 overflow-hidden">
						<li v-for="(item, i) in breadcrumbItems" :key="i" class="flex items-center gap-1 min-w-0 shrink-0">
							<AppIcon :name="item.icon" class="shrink-0 text-text-muted" />
							<router-link :to="item.to" class="truncate text-text-muted hover:text-brand transition-colors">
								{{ item.label }}
							</router-link>
							<span v-if="i < breadcrumbItems.length - 1" class="text-text-muted mx-1 shrink-0">/</span>
						</li>
					</ol>
				</nav>
			</div>
			<div id="top-bar-right" class="flex items-center gap-2 flex-shrink-0">
				<div class="relative bg-surface-base rounded-lg">
					<AppIcon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
					<input
						placeholder="Keyword"
						class="w-full pl-10 pr-4 py-2 bg-surface-base text-text-primary placeholder-text-muted border border-surface-overlay rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
					/>
				</div>
				<button
					:class="[getButtonClasses({ severity: 'info', text: true, rounded: true }), '!p-2 !min-w-0']"
					@click="toggleTheme"
				>
					<AppIcon :name="isDark ? 'sun' : 'moon'" />
				</button>
			</div>
		</div>
	</header>
</template>