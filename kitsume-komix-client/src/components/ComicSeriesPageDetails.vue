<script setup lang="ts">
	import { ref, computed } from 'vue';
	import Chip from 'primevue/chip';
	import Button from 'primevue/button';

	const props = defineProps({
		comicMetadataDetailsLabel: String,
		comicMetadataDetails: String,
		maxVisible: { type: Number, default: 5 }
	});

	const isExpanded = ref(false);

	const items = computed(() => {
		return props.comicMetadataDetails?.split(',').map((item: string) => item.trim()) || [];
	});

	const visibleItems = computed(() => {
		return isExpanded.value ? items.value : items.value.slice(0, props.maxVisible);
	});

	const hasMore = computed(() => items.value.length > props.maxVisible);
	const hiddenCount = computed(() => items.value.length - props.maxVisible);
</script>

<template>
	<div class="flex flex-col gap-2 w-full">
		<div class="flex flex-wrap items-center">
			<div class="font-bold">{{ comicMetadataDetailsLabel }}:&nbsp;</div>
			<div 
				v-for="(value, index) in visibleItems" 
				:key="index"
				class="comic-series-page-detail-item"
			>
				<Chip :label="value" class="m-1" />
			</div>
		</div>
		
		<!-- Show More/Less Button -->
		<div v-if="hasMore" class="flex items-center">
			<Button 
				:label="isExpanded ? 'Show Less' : `Show More (+${hiddenCount})`"
				@click="isExpanded = !isExpanded"
				text
				size="small"
				class="text-cyan-400 hover:text-cyan-300"
			/>
		</div>
	</div>
</template>