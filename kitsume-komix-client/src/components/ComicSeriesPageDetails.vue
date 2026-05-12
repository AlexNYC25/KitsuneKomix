<script setup lang="ts">
	import Button from 'primevue/button';
	import { ref, computed } from 'vue';

	const props = withDefaults(defineProps<{
		comicMetadataDetailsLabel?: string;
		comicMetadataDetails?: string;
		maxVisible?: number;
	}>(), {
		maxVisible: 5,
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
				<span class="inline-flex items-center rounded-full px-3 py-0.5 text-sm bg-surface-overlay text-text-secondary m-1">{{ value }}</span>
			</div>
		</div>
		
		<!-- Show More/Less Button -->
		<div v-if="hasMore" class="flex items-center">
			<Button 
				:label="isExpanded ? 'Show Less' : `Show More (+${hiddenCount})`"
				@click="isExpanded = !isExpanded"
				text
				size="small"
				class="text-brand hover:brightness-110"
			/>
		</div>
	</div>
</template>