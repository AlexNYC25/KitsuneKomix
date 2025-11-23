<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useComicSeriesStore } from '@/stores/comic-series'
import Breadcrumb from 'primevue/breadcrumb'
import InputGroup from 'primevue/inputgroup'
import InputText from 'primevue/inputtext'
import InputGroupAddon from 'primevue/inputgroupaddon'

const route = useRoute()
const comicSeriesStore = useComicSeriesStore()

const breadcrumbItems = ref<any[]>([])

const getComicSeriesName = async (seriesId: number): Promise<string> => {
	try {
		const series = await comicSeriesStore.lookupComicSeriesById(seriesId)
		return series?.name || 'Comic Series'
	} catch (error) {
		console.error('Failed to fetch series name:', error)
	}
	return 'Comic Series'
}

const getComicBookTitle = async (bookId: number): Promise<{ title: string; seriesId?: number }> => {
	try {
		const response = await fetch(`http://localhost:8000/api/comic-books/${bookId}/metadata`, {
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
			}
		})

		if (response.ok) {
			const data = await response.json()
			return {
				title: data.title || 'Comic Book',
				seriesId: data.comicSeriesId
			}
		}
	} catch (error) {
		console.error('Failed to fetch comic book title:', error)
	}
	return { title: 'Comic Book' }
}

const generateBreadcrumbs = async () => {
	const items: any[] = [
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
			const { title, seriesId } = await getComicBookTitle(bookId)

			// Add series in breadcrumb if available
			if (seriesId) {
				const seriesName = await getComicSeriesName(seriesId)
				items.push({
					label: seriesName,
					icon: 'pi pi-book',
					to: `/comic-series/${seriesId}`
				})
			}

			items.push({
				label: title,
				icon: 'pi pi-image',
				to: `/comic-book/${bookId}`
			})
		}
	}

	breadcrumbItems.value = items
}

// Watch route changes
watch(() => route.path, () => {
	generateBreadcrumbs()
}, { immediate: true })
</script>

<template>
	<header class="bg-gray-800 border-b border-gray-700">
		<!-- Breadcrumb Navigation with Search Bar -->
		<div class="flex justify-between items-center gap-4 p-4">
			<div id="top-bar-left" class="flex-grow">
				<Breadcrumb :model="breadcrumbItems" class="bg-transparent" />
			</div>
			<div id="top-bar-right" class="flex-shrink-0">
				<InputGroup class="bg-gray-700">
					<InputText placeholder="Keyword" class="bg-gray-700 text-white placeholder-gray-400" />
					<InputGroupAddon class="bg-gray-700">
						<i class="pi pi-search text-gray-400" />
					</InputGroupAddon>
				</InputGroup>
			</div>
		</div>
	</header>
</template>