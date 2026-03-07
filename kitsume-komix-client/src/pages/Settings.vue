<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<template>
  <div id="settings-page" class="p-6">
    <div class="mb-6 flex items-center gap-4">
      <Button 
        icon="pi pi-arrow-left" 
        severity="secondary"
        text 
        rounded
        @click="goBack"
        v-tooltip.top="'Go back'"
      />
      <h1 class="text-3xl font-bold">Settings</h1>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 max-w-2xl">
      <p class="text-gray-600 dark:text-gray-400">
        Settings page coming soon. Additional settings will be added here.
      </p>
    </div>
  </div>
</template>

<style scoped>
</style>
