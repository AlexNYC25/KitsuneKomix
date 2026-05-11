<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useLibrariesStore } from '@/stores/libraries';
import { useAuthStore } from '@/stores/auth';
import Button from 'primevue/button';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const librariesStore = useLibrariesStore();

const isActive = (path: string) => route.path === path;

const bookmarks = ref([
	{ label: 'Latest Comics', icon: 'md-menubook-sharp' },
	{ label: 'Latest Series', icon: 'io-library-sharp' },
	{ label: 'All Comics', icon: 'md-menubook-sharp' },
	{ label: 'All Comic Series', icon: 'io-library-sharp' },
	{ label: 'All Comic Series Groups', icon: 'hi-solid-library' },
	{ label: 'All Comic Readlists', icon: 'md-librarybooks-sharp' }
]);

const libraries = computed(() => {
  return librariesStore.sidePanelLibraries.map((library) => ({
    label: library.label,
	items: library.items
  }));
});

const handleLogout = async () => {
	authStore.logout();
	await router.push('/login');
};

const handleSettingsClick = async () => {
	await router.push('/settings');
};

const userDisplayName = computed(() => {
	const email = authStore.user?.email;
	return email ? email.split('@')[0] : 'User';
});
</script><template>
  <div id="sidebar" class="flex flex-col h-full">
    <div id="sidebar-header" class="px-4 pt-4 pb-3 border-b border-surface-elevated">
      <h2 class="text-2xl font-bold font-display text-brand">
			Kitsune Komix
		</h2>
    </div>

		<div id="sidebar-content" class="flex-1 overflow-y-auto">
			<div id="sidebar-home-section" class="py-2">
				<div
					class="flex items-center cursor-pointer transition-colors duration-150"
					:class="isActive('/') ? 'border-l-2 border-brand bg-brand/10 text-white' : 'border-l-2 border-transparent hover:border-brand/50 hover:bg-white/5 text-text-secondary hover:text-white'"
					@click="router.push('/')"
				>
					<v-icon name="la-home-solid" class="ml-4 shrink-0"/>
					<span class="ml-3 py-2 text-sm">Home</span>
				</div>
			</div>

			<div class="mx-3 border-t border-surface-elevated"></div>
			
			<div id="sidebar-bookmarks-section" class="py-2">
				<h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1 px-4">
					Bookmarks
				</h3>
				<div v-for="bookmark in bookmarks" :key="bookmark.label">
				  <div class="flex items-center cursor-pointer transition-colors duration-150 border-l-2 border-transparent hover:border-brand/50 hover:bg-white/5 text-text-secondary hover:text-white">
					<v-icon :name="bookmark.icon" class="ml-4 shrink-0" />
					<span class="ml-3 py-2 text-sm">{{ bookmark.label }}</span>
				  </div>
				</div>
			</div>

			<div class="mx-3 border-t border-surface-elevated"></div>

			<div id="sidebar-libraries" class="py-2">
				<h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1 px-4">
					Libraries
				</h3>
				<div v-for="library in libraries" :key="library.label">
				  <div class="flex items-center cursor-pointer transition-colors duration-150 border-l-2 border-transparent hover:border-brand/50 hover:bg-white/5 text-text-secondary hover:text-white">
					<v-icon name="md-locallibrary" class="ml-4 shrink-0" />
					<span class="ml-3 py-2 text-sm">{{ library.label }}</span>
				  </div>
				</div>
			</div>

		</div>

		<div class="mx-3 border-t border-surface-elevated"></div>

		<div id="sidebar-user-info" class="flex items-center gap-3 px-4 py-3">
			<div id="sidebar-user-avatar" class="shrink-0">
				<div class="w-9 h-9 rounded-full bg-brand/20 flex items-center justify-center text-brand text-sm font-bold">
					{{ userDisplayName.charAt(0).toUpperCase() }}
				</div>
			</div>
			<div id="sidebar-user-details" class="min-w-0 flex-1">
				<div id="sidebar-user-name" class="text-sm font-semibold text-text-primary truncate">{{ userDisplayName }}</div>
				<div id="sidebar-user-email" class="text-xs text-text-muted truncate">
					{{ authStore.user?.email || 'No email' }}
				</div>
			</div>
			<div id="sidebar-user-actions" class="flex gap-1 shrink-0">
				<Button severity="info" class="!p-1.5 !min-w-0" rounded text @click="handleSettingsClick">
					<v-icon name="md-manageaccounts" />
				</Button>
				<Button severity="info" class="!p-1.5 !min-w-0" rounded text @click="handleLogout">
					<v-icon name="md-logout" />
				</Button>
			</div>
		</div>

		<div id="sidebar-footer" class="px-4 pb-3">
			<p class="text-xs text-text-muted">&copy; {{ new Date().getFullYear() }} Kitsune Komix</p>
		</div>
  </div>
</template>

<style scoped>
</style>