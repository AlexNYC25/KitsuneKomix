<script setup lang="ts">
import { useRouter } from 'vue-router';

import type { ComicBook } from '@/types';
import { toAbsoluteImageUrl } from '@/utilities/image';

const router = useRouter();

const props = defineProps<{
	comicBookData: ComicBook;
}>();

const goToComicBook = (id: string | number) => {
	router.push(`/comic-book/${String(id)}`);
}

const imageUrl = props.comicBookData.thumbnailUrl ? toAbsoluteImageUrl(props.comicBookData.thumbnailUrl) : '';
</script>

<template>
    <div class="comic-series-card flex flex-col w-64 cursor-pointer my-2" @click="goToComicBook(comicBookData.id)">
        <div class="thumbnail relative w-full h-full bg-gray-200 rounded overflow-hidden">
            <!-- Thumbnail -->
            <img 
                v-if="comicBookData?.thumbnailUrl" 
                :src="imageUrl"  
                :alt="comicBookData.title || 'Comic Book Thumbnail'" 
                class="w-full h-full object-fit"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-500">
                No Image
            </div>

            <!-- Overlay on hover -->
            <div class="absolute inset-0 bg-black opacity-0 hover:opacity-65 transition-opacity duration-300 flex flex-col text-white text-4xl  font-bold items-start justify-end">
                <!-- Title -->
                <div class="font-display">
                    {{ comicBookData.title }}
                </div>
            </div>
        </div>
    </div>
</template>