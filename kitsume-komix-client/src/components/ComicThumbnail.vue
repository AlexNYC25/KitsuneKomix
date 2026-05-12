<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';

import { resolveImageSrc, revokeBlobUrl } from '@/utilities/image';

const props = defineProps<{
  thumbnailUrl?: string;
  comicName?: string;
}>();

const imageSrc = ref<string>('');

const revokeImageUrl = () => {
	revokeBlobUrl(imageSrc.value);
	imageSrc.value = '';
};

const loadThumbnail = async () => {
	revokeImageUrl();

	if (!props.thumbnailUrl) {
		return;
	}

	imageSrc.value = await resolveImageSrc(props.thumbnailUrl);
};

watch(
	() => props.thumbnailUrl,
	() => {
		void loadThumbnail();
	},
	{ immediate: true }
);

onBeforeUnmount(() => {
	revokeImageUrl();
});
</script>

<template>
    <div class="flex-shrink-0 w-full max-w-[280px] group cursor-pointer">
			<div class="aspect-[2/3] bg-surface-base rounded-lg overflow-hidden flex items-center justify-center relative transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-elevated">
				<img
					v-if="imageSrc"
					:src="imageSrc"
					:alt="comicName || 'Series Thumbnail'"
					class="w-full h-full object-contain"
				/>
				<div v-else class="w-full h-full bg-surface-overlay flex items-center justify-center">
					<span class="text-text-muted">No Image</span>
				</div>
				
				<div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center p-4 pointer-events-none">
					<span class="text-text-primary font-bold text-xl text-center drop-shadow-md">{{ comicName || 'Series Thumbnail' }}</span>
				</div>
			</div>
		</div>
</template>