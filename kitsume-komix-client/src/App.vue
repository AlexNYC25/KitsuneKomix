<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <header>
  </header>
  <nav>
    <RouterLink to="/">Home</RouterLink> |
    <RouterLink to="/Login">Login</RouterLink> |
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
</style>
