<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import SideBar from './components/SideBar.vue';
</script>

<template>
  <header>
  </header>

  
  <main class="flex h-screen w-screen">
    <SideBar />
    <div class="flex-1 bg-gray-100 p-4">
      <RouterView />
    </div>
  </main>
    
</template>

<style scoped>
</style>
