<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import { useAuthStore } from '@/stores/auth';
import { useLibrariesStore } from '@/stores/libraries';

const router = useRouter();
const authStore = useAuthStore();
const librariesStore = useLibrariesStore();

const libraries = computed(() => librariesStore.getLibraries);
const isAdmin = computed(() => Boolean(authStore.user?.admin));

const showAddLibraryForm = ref(false);
const newLibraryName = ref('');
const newLibraryPath = ref('');
const isSavingLibrary = ref(false);
const addLibraryError = ref<string | null>(null);

const goBack = () => {
  router.back();
};

const handleAddLibrary = () => {
  showAddLibraryForm.value = true;
  addLibraryError.value = null;
};

const resetAddLibraryForm = () => {
  showAddLibraryForm.value = false;
  newLibraryName.value = '';
  newLibraryPath.value = '';
  addLibraryError.value = null;
};

const submitAddLibraryForm = async () => {
  const name = newLibraryName.value.trim();
  const path = newLibraryPath.value.trim();

  if (!name || !path) {
    addLibraryError.value = 'Library name and library path are required.';
    return;
  }

  isSavingLibrary.value = true;
  addLibraryError.value = null;

  try {
    await librariesStore.createLibrary({
      name,
      path,
    });

    resetAddLibraryForm();
  } catch (error) {
    addLibraryError.value = error instanceof Error
      ? error.message
      : 'Failed to create library.';
  } finally {
    isSavingLibrary.value = false;
  }
};

onMounted(async () => {
  if (librariesStore.getLibraries.length === 0) {
    try {
      await librariesStore.requestUsersLibraries();
    } catch (error) {
      console.error('Failed to load libraries for settings page:', error);
    }
  }
});
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

    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-semibold">Libraries</h2>

        <Button
          v-if="isAdmin"
          label="Add Library"
          icon="pi pi-plus"
          severity="info"
          @click="handleAddLibrary"
        />
      </div>

      <form
        v-if="showAddLibraryForm && isAdmin"
        class="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
        @submit.prevent="submitAddLibraryForm"
      >
        <h3 class="text-lg font-semibold">Add New Library</h3>

        <div>
          <label for="library-name" class="block text-sm font-medium mb-1">Library Name</label>
          <input
            id="library-name"
            v-model="newLibraryName"
            type="text"
            placeholder="e.g. My Comics"
            class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
        </div>

        <div>
          <label for="library-path" class="block text-sm font-medium mb-1">Library Path</label>
          <input
            id="library-path"
            v-model="newLibraryPath"
            type="text"
            placeholder="e.g. /Volumes/Media/Comics"
            class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
        </div>

        <p v-if="addLibraryError" class="text-sm text-red-500">{{ addLibraryError }}</p>

        <div class="flex items-center gap-2">
          <Button
            type="submit"
            label="Save Library"
            icon="pi pi-check"
            severity="info"
            :loading="isSavingLibrary"
          />
          <Button
            type="button"
            label="Cancel"
            icon="pi pi-times"
            severity="secondary"
            text
            @click="resetAddLibraryForm"
            :disabled="isSavingLibrary"
          />
        </div>
      </form>

      <div v-if="libraries.length === 0" class="text-gray-600 dark:text-gray-400">
        No libraries found.
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <div
          v-for="library in libraries"
          :key="library.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <h3 class="text-lg font-semibold mb-1">{{ library.name }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 break-all">
            {{ library.path }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
