<script setup lang="ts">
  import { useRouter } from 'vue-router';

  import LibrarySettings from '@/components/Settings/LibrarySettings.vue';
  import UserSettings from '@/components/Settings/UserSettings.vue';
  import ErrorBoundary from '@/components/states/ErrorBoundary.vue';

  const router = useRouter();

  const goBack = () => {
    const backPath = router.options.history.state.back;

    if (typeof backPath === 'string' && backPath.startsWith('/login')) {
      router.replace('/');
      return;
    }

    router.back();
  };

</script>

<template>
  <div id="settings-page" class="p-6">
    <div class="mb-6 flex items-center gap-4">
      <button
				class="p-2 rounded bg-brand hover:bg-blue-200 dark:hover:bg-blue-200"
        @click="goBack"
        v-tooltip.top="'Go back'"
      >
				<v-icon name="io-arrow-back"/>
			</button>
      <h1 class="text-3xl font-bold font-display">Settings</h1>
    </div>

    <ErrorBoundary>
      <LibrarySettings />
    </ErrorBoundary>

    <ErrorBoundary>
      <UserSettings />
    </ErrorBoundary>
  </div>
</template>

<style scoped>
</style>
