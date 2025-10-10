<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import SideBar from './components/SideBar.vue';
import TopBar from './components/TopBar.vue';

const $route = useRoute();
</script>

<template>
  <main class="h-screen w-full overflow-hidden">
    <template v-if="$route.meta.layout !== 'auth'">
      <div class="flex flex-row h-full">
        <SideBar class="w-64 bg-sky-950 text-white flex-shrink-0" />
        <div class="flex-1 flex flex-col min-w-0">
          <TopBar />
          <RouterView class="flex-1 overflow-auto" />
        </div>
      </div>
    </template>
    <template v-else>
      <RouterView class="h-full w-full" />
    </template>
  </main>
</template>

<style scoped>
</style>
