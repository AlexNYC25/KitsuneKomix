<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import SideBar from '@/components/SideBar.vue';
import TopBar from '@/components/TopBar.vue';
import Toast from 'primevue/toast';
import { useAuthStore } from '@/stores/auth';
import { setTokenRefreshCallback } from '@/utilities/apiClient';

const $route = useRoute();
const sidebarOpen = ref(false);

const closeSidebar = () => { sidebarOpen.value = false; };
const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value; };

watch(() => $route.path, () => {
  if (window.innerWidth < 768) sidebarOpen.value = false;
});

onMounted(() => {
  const mql = window.matchMedia('(max-width: 767px)');
  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    if (!e.matches) sidebarOpen.value = false;
  };
  mql.addEventListener('change', handler);
  onBeforeUnmount(() => mql.removeEventListener('change', handler));

  const authStore = useAuthStore();
  if (authStore.isAuthenticated) {
    setTokenRefreshCallback(() => authStore.refresh());
    authStore.postLoginActions();
  }
});
</script>

<template>
  <main class="h-screen w-full overflow-hidden bg-surface-base text-text-primary">
    <template v-if="$route.meta.layout !== 'auth'">
      <div class="flex flex-row h-full">
        <SideBar class="hidden md:flex w-64 bg-surface-overlay flex-shrink-0" />

        <div v-if="sidebarOpen" class="fixed inset-0 z-50 md:hidden">
          <div class="fixed inset-0 bg-black/50" @click="closeSidebar"></div>
          <aside class="fixed top-0 left-0 h-full w-64 bg-surface-overlay z-10 shadow-elevated animate-fade-in-up">
            <SideBar />
          </aside>
        </div>

        <div class="flex-1 flex flex-col min-w-0">
          <TopBar @toggle-sidebar="toggleSidebar" />
          <RouterView v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <component :is="Component" class="flex-1 overflow-auto" />
            </Transition>
          </RouterView>
        </div>
      </div>
    </template>
    <template v-else>
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" class="h-full w-full" />
        </Transition>
      </RouterView>
    </template>
    <Toast position="bottom-right" />
  </main>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
