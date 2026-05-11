<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title?: string
  sizeClass?: string
  borderColor?: string
  padding?: 'md' | 'lg'
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <div
    v-if="modelValue"
    class="flex flex-col fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mb-6 shadow-2xl border rounded-lg bg-surface-elevated"
    :class="[sizeClass ?? 'w-auto', borderColor ?? 'border-surface-overlay', padding === 'lg' ? 'p-6 space-y-6' : 'p-4 space-y-4']"
  >
    <h3 v-if="title" class="text-lg font-semibold">{{ title }}</h3>
    <slot />
  </div>
</template>
