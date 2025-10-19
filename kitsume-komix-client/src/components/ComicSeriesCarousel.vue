<script setup lang="ts">
import { ref } from 'vue';
	import Carousel from 'primevue/carousel';
	import Button from 'primevue/button';

	defineProps(['comicSeriesData'])

	const carouselResponsiveOptions = ref([
		{
			breakpoint: '991px',
			numVisible: 2,
			numScroll: 1
		},
		{
			breakpoint: '575px',
			numVisible: 1,
			numScroll: 1
		}
	]);
</script>

<template>
	<Carousel 
		:value="comicSeriesData" 
		:numVisible="4" 
		:numScroll="1" 
		:circular="true" 
		:autoplayInterval="3000"
		:responsiveOptions="carouselResponsiveOptions" 
		class="py-3"
		:pt="{
			contentContainer: () => ({
				class: 'flex'
			}),
			content: () => ({
				class: 'flex w-full max-w-none'
			}),
			itemList: () => ({
				class: 'flex'
			}),
			pcNextButton: () => ({
				root: 'ml-auto'
			})
		}"
		unstyled
	>
		<template #item="slotProps">
			<div class="comic-series-card px-4 py-2">
				<div class="comic-series-card-image-container mb-3">
					<img :src="slotProps.data.thumbnailUrl" :alt="slotProps.data.name"
						class="h-80 object-contain" />
				</div>
				<div class="comic-series-card-details">
					<h4 class="mb-1">{{ slotProps.data.name }}</h4>
				</div>
				<div class="comic-series-card-actions flex justify-end">
					<Button label="View" class="w-20" />

				</div>
			</div>
		</template>
	</Carousel>
</template>
