<script setup lang="ts">
import { ref } from 'vue';

import Button from 'primevue/button';
import Divider from 'primevue/divider';
import PanelMenu from 'primevue/panelmenu';

const bookmarks = ref([
	{ label: 'Latest Comics' },
	{ label: 'Latest Series' },
	{ label: 'All Comics' },
	{ label: 'All Comic Series'},
	{ label: 'All Comic Series Groups'},
	{ label: 'All Comic Readlists'}
]);

const libraries = ref([
	{
		label: 'DC Comics',
		items: bookmarks
	},
	{
		label: 'Marvel Comics',
		items: bookmarks
	}
]);

const iconLookup: Record<string, string> = {
  'Latest Comics': 'md-menubook-sharp',
  'Latest Series': 'io-library-sharp',
  'All Comics': 'md-menubook-sharp',
  'All Comic Series': 'io-library-sharp',
  'All Comic Series Groups': 'hi-solid-library',
  'All Comic Readlists': 'md-librarybooks-sharp',
};

// Add icons to the libraries structure dynamically
libraries.value = libraries.value.map((library) => ({
  ...library,
  items: library.items.map((item) => ({
    ...item,
    icon: iconLookup[item.label] || '', // Add icon if it exists in the lookup
  })),
}));
</script>

<template>
  <div id="sidebar" class="	bg-sky-950 text-white w-64 h-screen">
    <div id="sidebar-header">
      <h2>Kitsume Komix</h2>
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
				<h3>Bookmarks</h3>
				<div v-for="bookmark in bookmarks" :key="bookmark.label" class="flex items-center">
				  <Button :label="bookmark.label" variant="text" class="w-full flex !justify-start items-center">
					<v-icon v-if="iconLookup[bookmark.label]" :name="iconLookup[bookmark.label]" class="ml-2" />
					<p class="ml-2">{{ bookmark.label }}</p>
				  </Button>
				</div>
			</div>

			<div id="sidebar-libraries">
				<h3>Libraries</h3>
				<PanelMenu :model="libraries" class="">
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