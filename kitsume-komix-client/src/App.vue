<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import SideBar from './components/SideBar.vue';
import TopBar from './components/TopBar.vue';

</script>

<template>

  <main class="flex flex-row h-screen w-full overflow-hidden">
    <SideBar class="w-64 bg-sky-950 text-white flex-shrink-0"/>
    <div class="flex-1 flex flex-col min-w-0">
      <TopBar />
      <RouterView class="flex-1 overflow-auto" />
    </div>
  </main>
    
</template>

<style scoped>
</style>
