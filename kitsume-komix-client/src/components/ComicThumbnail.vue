<script setup lang="ts">
import { defineProps } from 'vue';
import { composeStaticUrl } from '@/utilities/apiClient';

const props = defineProps<{
  thumbnailUrl?: string;
  comicName?: string;
}>();
</script>

<template>
    <div class="flex-shrink-0 w-70 h-full">
			<div class=" bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
				<img
					v-if="thumbnailUrl"
					:src=composeStaticUrl(thumbnailUrl)
					:alt="comicName || 'Series Thumbnail'"
					class="w-full h-full object-contain"
				/>
				<div v-else class="w-full h-full bg-gray-700 flex items-center justify-center">
					<span class="text-gray-500">No Image</span>
				</div>
			</div>
		</div>
</template>