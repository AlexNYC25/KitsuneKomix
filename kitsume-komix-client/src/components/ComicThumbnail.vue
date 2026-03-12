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
    <div class="flex-shrink-0 w-70 h-full">
			<div class=" bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
				<img
					v-if="imageSrc"
					:src="imageSrc"
					:alt="comicName || 'Series Thumbnail'"
					class="w-full h-full object-contain"
				/>
				<div v-else class="w-full h-full bg-gray-700 flex items-center justify-center">
					<span class="text-gray-500">No Image</span>
				</div>
			</div>
		</div>
</template>