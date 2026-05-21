<script setup lang="ts">
import { getButtonClasses } from '@/composables/useButton';

import SkeletonCard from '../states/SkeletonCard.vue';

defineProps<{
  errorMessage: string | null;
  isEmpty: boolean;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  retry: [];
}>();
</script>

<template>
  <div class="flex-1 p-4 mx-8">
    <div v-if="isLoading" class="grid grid-cols-5 gap-6">
      <SkeletonCard v-for="i in 10" :key="`loading-${i}`" height="280px" />
    </div>

    <div v-else-if="errorMessage" class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 class="text-xl font-semibold text-text-primary mb-2">Unable to load comic series</h3>
      <p class="text-text-secondary max-w-md mb-6">{{ errorMessage }}</p>
      <button
        type="button"
        :class="getButtonClasses({ severity: 'info' })"
        @click="emit('retry')"
      >
        Retry
      </button>
    </div>

    <div v-else-if="isEmpty" class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 class="text-xl font-semibold text-text-primary mb-2">No comic series found</h3>
      <p class="text-text-secondary max-w-md">
        Try changing your filters or sort options to find more results.
      </p>
    </div>

    <slot v-else />
  </div>
</template>
