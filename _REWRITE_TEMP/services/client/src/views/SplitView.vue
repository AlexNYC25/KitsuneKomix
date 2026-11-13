<script setup lang="ts">
import { RouterView } from 'vue-router'

import AppSidebar from '../components/AppSidebar.vue'
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <AppSidebar />

    <main>
      <RouterView />
    </main>
  </div>
</template>