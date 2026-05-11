<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

withDefaults(defineProps<{
  fallbackMessage?: string
}>(), {
  fallbackMessage: 'Something went wrong'
})

const hasError = ref(false)

onErrorCaptured((err: unknown) => {
  console.error('[ErrorBoundary]', err)
  hasError.value = true
  return false
})

const resetError = () => {
  hasError.value = false
}
</script>

<template>
  <template v-if="hasError">
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <v-icon name="io-close" class="text-5xl text-brand-danger mb-4" />
      <h3 class="text-xl font-semibold text-text-primary mb-2">{{ fallbackMessage }}</h3>
      <Button label="Try Again" severity="info" @click="resetError" />
    </div>
  </template>
  <template v-else>
    <slot />
  </template>
</template>
