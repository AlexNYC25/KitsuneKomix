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

</script>

<template>
  <div id="sidebar" class="bg-gray-800 text-white w-64 h-screen">
    <div id="sidebar-header">
			<Button icon="pi pi-home" class="p-button-text p-button-plain" />
      <h2>Kitsume Komix</h2>
    </div>

		<div id="sidebar-content">
			<div id="sidebar-home-section" class="sidebar-section">
				<Button label="Home" variant="text" />
			</div>
			<Divider />

			<div id="sidebar-bookmarks-section" >
				<h3>Bookmarks</h3>
				<div v-for="bookmark in bookmarks" :key="bookmark.label">
					<Button :label="bookmark.label" variant="text" class="w-full justify-start" />
				</div>
				<Divider />
			</div>

			<div id="sidebar-libraries">
				<h3>Libraries</h3>
				<PanelMenu :model="libraries" class="w-full" />
				<Divider />
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