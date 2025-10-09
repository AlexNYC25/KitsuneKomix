<script setup lang="ts">
import { ref, computed } from 'vue';

import { useLibrariesStore } from '@/stores/libraries';

import Button from 'primevue/button';
import Divider from 'primevue/divider';
import PanelMenu from 'primevue/panelmenu';

const librariesStore = useLibrariesStore();

const bookmarks = ref([
	{ label: 'Latest Comics', icon: 'md-menubook-sharp' },
	{ label: 'Latest Series', icon: 'io-library-sharp' },
	{ label: 'All Comics', icon: 'md-menubook-sharp' },
	{ label: 'All Comic Series', icon: 'io-library-sharp' },
	{ label: 'All Comic Series Groups', icon: 'hi-solid-library' },
	{ label: 'All Comic Readlists', icon: 'md-librarybooks-sharp' }
]);

// Updated computed property to align with the new `libraries` state structure
const libraries = computed(() => {
  return librariesStore.sidePanelLibraries.map((library) => ({
    label: library.label,
		items: library.items
  }));
});
</script>

<template>
  <div id="sidebar">
    <div id="sidebar-header">
      <h2 class="text-2xl font-bold mx-2" style="color: var(--p-secondary-color)">
				Kitsume Komix
			</h2>
    </div>

		<div id="sidebar-content">
			<div id="sidebar-home-section" class="sidebar-section mb-2 mt-2">
				<Button variant="text" class="w-full flex !justify-start items-center">
					<v-icon name="la-home-solid" class="ml-2"/>
					<p class="ml-2">
						Home
					</p>
				</Button>
			</div>
			
			<div id="sidebar-bookmarks-section" >
				<h3 class="text-lg font-semibold mb-2 mx-2" style="color: var(--p-secondary-color)">
					Bookmarks
				</h3>
				<div v-for="bookmark in bookmarks" :key="bookmark.label" class="flex items-center">
				  <Button :label="bookmark.label" variant="text" class="w-full flex !justify-start items-center">
					<v-icon v-if="bookmark.icon" :name="bookmark.icon" class="ml-2" />
					<p class="ml-2">{{ bookmark.label }}</p>
				  </Button>
				</div>
			</div>

			<div id="sidebar-libraries">
				<h3 class="text-lg font-semibold mb-2 mx-2" style="color: var(--p-secondary-color)">
					Libraries
				</h3>
				<PanelMenu :model="libraries" class="mx-2">
					<template #item="{ item }">
						<div class="card flex items-center">
							<v-icon v-if="item.icon" :name="item.icon" class="ml-2" />
							<span>{{ item.label }}</span>
						</div>
					</template>
				</PanelMenu>
			</div>

			
		</div>

		<div id="sidebar-footer">
			<Button label="Account Settings" variant="text" class="w-full justify-start" />
			<div id="sidebar-footer-user-info" class="flex flex-col items-start mt-2 mb-2">
				<div id="sidebar-footer-user-avatar" class="mb-1">
					<img src="https://www.gravatar.com/avatar?d=mp&s=40" alt="User Avatar" class="rounded-full" />
				</div>
				<div id="sidebar-footer-user-name" class="font-bold">John Doe</div>
				<div id="sidebar-footer-user-email" class="text-sm text-gray-500">
					johndoe@example.com
				</div>
			</div>
			<p>&copy; 2024 Kitsume Komix</p>
		</div>
  </div>
</template>

<style scoped>
</style>