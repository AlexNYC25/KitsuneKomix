<script setup lang="ts">
import { ref } from 'vue';

import Galleria from 'primevue/galleria';

const responsiveOptions = ref([
	{
		breakpoint: '991px',
		numVisible: 3
	},
	{
		breakpoint: '767px',
		numVisible: 3
	},
	{
		breakpoint: '575px',
		numVisible: 1
	}
]);

const images = ref(
	[
		{
			itemImageSrc: 'https://placehold.co/1600x400/blue/white',
			thumbnailImageSrc: 'https://placehold.co/600x400/blue/white',
			alt: 'Description for Image 1',
			title: 'Title 1'
		},
		{
			itemImageSrc: 'https://placehold.co/1600x400/orange/white',
			thumbnailImageSrc: 'https://placehold.co/600x400/orange/white',
			alt: 'Description for Image 2',
			title: 'Title 2'
		},
		{
			itemImageSrc: 'https://placehold.co/1600x400/yellow/white',
			thumbnailImageSrc: 'https://placehold.co/600x400/yellow/white',
			alt: 'Description for Image 3',
			title: 'Title 3'
		},
		{
			itemImageSrc: 'https://placehold.co/1600x400/green/white',
			thumbnailImageSrc: 'https://placehold.co/600x400/green/white',
			alt: 'Description for Image 4',
			title: 'Title 4'
		},
		{
			itemImageSrc: 'https://placehold.co/1600x400/black/white',
			thumbnailImageSrc: 'https://placehold.co/600x400/black/white',
			alt: 'Description for Image 5',
			title: 'Title 5'
		},
		{
			itemImageSrc: 'https://placehold.co/1600x400/purple/white',
			thumbnailImageSrc: 'https://placehold.co/600x400/purple/white',
			alt: 'Description for Image 6',
			title: 'Title 6'
		}
	]
);

</script>

<template>
  <div class="card w-full">
		<Galleria :value="images" :responsiveOptions="responsiveOptions" :numVisible="5" :circular="false"
			:showItemNavigators="true" :showThumbnails="false" :showItemNavigatorsOnHover="true" :showIndicators="true">
			<template #item="slotProps" class="flex justify-center">
				<img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" />
			</template>
			<template #thumbnail="slotProps">
				<img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" />
			</template>
		</Galleria>
	</div>
</template>