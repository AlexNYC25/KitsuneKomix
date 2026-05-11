<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useComicSeriesStore } from '@/stores/comic-series'
import { useBreadcrumbStore } from '@/stores/breadcrumb'
import { useTheme } from '@/composables/useTheme'
import Breadcrumb from 'primevue/breadcrumb'
import InputGroup from 'primevue/inputgroup'
import InputText from 'primevue/inputtext'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Button from 'primevue/button'

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
			icon: 'pi pi-home',
			to: '/'
		}
	]

	if (route.path.includes('/comic-series')) {
		const seriesId = parseInt(route.params.id as string)
		if (!isNaN(seriesId)) {
			const seriesName = await getComicSeriesName(seriesId)
			items.push({
				label: seriesName,
				icon: 'pi pi-book',
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
					icon: 'pi pi-book',
					to: `/comic-series/${seriesId}`
				})
			}

			items.push({
				label: breadcrumbStore.comicBookTitle || 'Comic Book',
				icon: 'pi pi-image',
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
			<div id="top-bar-left" class="flex-grow">
				<Breadcrumb :model="breadcrumbItems" class="bg-transparent" />
			</div>
			<div id="top-bar-right" class="flex items-center gap-2 flex-shrink-0">
				<InputGroup class="bg-surface-base">
					<InputText placeholder="Keyword" class="bg-surface-base text-text-primary placeholder-text-muted" />
					<InputGroupAddon class="bg-surface-base">
						<i class="pi pi-search text-text-muted" />
					</InputGroupAddon>
				</InputGroup>
				<Button
					:icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
					severity="info"
					text
					rounded
					class="!p-2 !min-w-0"
					@click="toggleTheme"
				/>
			</div>
		</div>
	</header>
</template>