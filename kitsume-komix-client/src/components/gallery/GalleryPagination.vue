<script setup lang="ts">
import type { PaginationPage } from '@/composables/usePagination';

defineProps<{
  currentPage: number;
  displayTotalPages: number;
  hasNextPage: boolean;
  pageSize: number;
  totalCount: number;
  visiblePages: PaginationPage[];
}>();

const emit = defineEmits<{
  goToPage: [page: number];
}>();

const handleGoToPage = (page: number) => {
  emit('goToPage', page);
};
</script>

<template>
  <div v-if="displayTotalPages > 1" class="flex items-center justify-between px-8 py-4 mx-5 mb-5">
    <span class="text-sm text-text-secondary">
      Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} series
    </span>
    <div class="flex items-center gap-1">
      <button
        type="button"
        @click="handleGoToPage(1)"
        :disabled="currentPage === 1"
        class="px-3 py-1.5 rounded-md text-sm border border-white/15 bg-black/30 text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/50 transition-colors"
      >
        First
      </button>
      <button
        type="button"
        @click="handleGoToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1.5 rounded-md text-sm border border-white/15 bg-black/30 text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/50 transition-colors"
      >
        Prev
      </button>
      <template v-for="(item, idx) in visiblePages" :key="idx">
        <span v-if="item === 'ellipsis'" class="px-2 text-text-secondary select-none">…</span>
        <button
          v-else
          type="button"
          @click="handleGoToPage(item)"
          :class="[
            'w-9 h-9 rounded-md text-sm border transition-colors',
            item === currentPage
              ? 'bg-primary/30 border-primary/60 text-text-primary font-medium'
              : 'bg-black/30 border-white/15 text-text-primary hover:bg-black/50'
          ]"
        >
          {{ item }}
        </button>
      </template>
      <button
        type="button"
        @click="handleGoToPage(currentPage + 1)"
        :disabled="!hasNextPage"
        class="px-3 py-1.5 rounded-md text-sm border border-white/15 bg-black/30 text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/50 transition-colors"
      >
        Next
      </button>
      <button
        type="button"
        @click="handleGoToPage(displayTotalPages)"
        :disabled="currentPage === displayTotalPages"
        class="px-3 py-1.5 rounded-md text-sm border border-white/15 bg-black/30 text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/50 transition-colors"
      >
        Last
      </button>
    </div>
  </div>
</template>
