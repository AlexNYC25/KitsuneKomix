<script setup lang="ts">
	import Chip from 'primevue/chip';

	defineProps(['comicMetadataDetailsLabel', 'comicMetadataDetails'])
</script>

<template>
	<div class="flex flex-wrap w-full items-center">
		<div class="font-bold">{{ comicMetadataDetailsLabel }}:&nbsp;</div>
		<div 
			v-for="(value, index) in comicMetadataDetails?.split(',')" 
			:key="index"
			class="comic-series-page-detail-item"
		>
			<Chip :label="value" class="m-1" />
		</div>
	</div>
</template>