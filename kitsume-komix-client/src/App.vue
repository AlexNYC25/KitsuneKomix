<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import SideBar from '@/components/SideBar.vue';
import TopBar from '@/components/TopBar.vue';
import Toast from 'primevue/toast';

const $route = useRoute();
</script>

<template>
  <main class="h-screen w-full overflow-hidden">
    <template v-if="$route.meta.layout !== 'auth'">
      <div class="flex flex-row h-full">
        <SideBar class="w-64 bg-surface-overlay text-white flex-shrink-0" />
        <div class="flex-1 flex flex-col min-w-0">
          <TopBar />
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
