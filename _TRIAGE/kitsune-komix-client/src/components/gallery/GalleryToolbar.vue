<script setup lang="ts">
import { PAGE_SIZE_OPTIONS, SORT_OPTIONS } from '@/config/gallery';

import AppIcon from '../icons/AppIcon.vue';

const props = defineProps<{
  areThereActiveFilters: boolean;
  isLatestRoute: boolean;
  pageSize: number;
  showFilters: boolean;
  sortCategory: string;
  totalCount: number;
}>();

const emit = defineEmits<{
  'update:pageSize': [value: number];
  'update:showFilters': [value: boolean];
  'update:sortCategory': [value: string];
}>();

const toggleFilters = () => {
  emit('update:showFilters', !props.showFilters);
};

const updateSortCategory = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:sortCategory', target.value);
};

const updatePageSize = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:pageSize', Number(target.value));
};
</script>

<template>
  <div
    class="w-lwh h-14 mx-5 mt-7 bg-surface-elevated border border-white/10 flex items-center justify-between px-4"
    :class="{ 'rounded-b-none': showFilters, 'rounded-xl': !showFilters, 'rounded-t-xl': showFilters }"
  >
    <div class="flex items-center gap-3">
      <button
        type="button"
        @click="toggleFilters"
        :class="[
          'px-3 py-1.5 rounded-md text-text-primary text-sm font-medium border transition-colors',
          areThereActiveFilters
            ? 'bg-primary/30 border-primary/60 hover:bg-primary/40'
            : 'bg-black/40 border-white/15 hover:bg-black/60'
        ]"
      >
        <AppIcon v-if="areThereActiveFilters" name="filter" scale="0.8" class="mr-1" />
        <AppIcon v-else name="filterOff" scale="0.8" class="mr-1" />
        Filters
      </button>

      <label for="sort-by" class="text-sm text-text-secondary">Sort by</label>
      <select
        id="sort-by"
        :value="sortCategory"
        @change="updateSortCategory"
        :disabled="isLatestRoute"
        class="px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <option v-for="option in SORT_OPTIONS" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <label for="page-size" class="text-sm text-text-secondary">Per page</label>
      <select
        id="page-size"
        :value="pageSize"
        @change="updatePageSize"
        class="px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
      >
        <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">{{ size }}</option>
      </select>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        aria-label="Grid view"
        class="w-9 h-9 rounded-md bg-black/40 border border-white/15 text-text-primary text-sm"
      >
        <AppIcon name="grid" scale="0.8" />
      </button>
      <button
        type="button"
        aria-label="List view"
        class="w-9 h-9 rounded-md bg-black/40 border border-white/15 text-text-primary text-sm"
      >
        <AppIcon name="list" scale="0.8" />
      </button>
      <span class="ml-2 text-sm text-text-secondary">{{ totalCount }} series</span>
    </div>
  </div>
</template>
