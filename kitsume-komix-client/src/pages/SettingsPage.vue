<script setup lang="ts">
  import { useRouter } from 'vue-router';

  import LibrarySettings from '@/components/Settings/LibrarySettings.vue';
  import UserSettings from '@/components/Settings/UserSettings.vue';

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
				class="p-2 rounded bg-cyan-700 hover:bg-blue-200 dark:hover:bg-blue-200"
        @click="goBack"
        v-tooltip.top="'Go back'"
      >
				<v-icon name="io-arrow-back"/>
			</button>
      <h1 class="text-3xl font-bold">Settings</h1>
    </div>

    <LibrarySettings />
    
    <UserSettings />
  </div>
</template>

<style scoped>
</style>
