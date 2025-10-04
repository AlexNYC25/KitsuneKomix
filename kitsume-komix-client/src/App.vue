<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import SideBar from './components/SideBar.vue';
import TopBar from './components/TopBar.vue';

</script>

<template>

  <main class="flex h-screen w-screen">
    <SideBar />
    <div id="top-bar" class="flex-1 bg-gray-100 p-4">
      <div class="flex flex-col h-full">
        <TopBar />
        <RouterView />
      </div>
      
    </div>
  </main>
    
</template>

<style scoped>
</style>
