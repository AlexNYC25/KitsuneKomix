<script setup lang="ts">
import { useRouter } from 'vue-router'

import { getButtonClasses } from '@/composables/useButton'

defineProps<{
  icon?: string
  title: string
  message: string
  actionLabel?: string
  actionRoute?: string
}>()

const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <v-icon v-if="icon" :name="icon" class="text-5xl text-text-muted mb-4" />
    <h3 class="text-xl font-semibold text-text-primary mb-2">{{ title }}</h3>
    <p class="text-text-secondary max-w-md mb-6">{{ message }}</p>
    <button
      v-if="actionLabel && actionRoute"
      :class="getButtonClasses({ severity: 'info' })"
      @click="router.push(actionRoute)"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
