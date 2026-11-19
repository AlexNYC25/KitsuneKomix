<script setup lang="ts">
definePageMeta({ middleware: "require-auth", layout: "dashboard" });
</script>

<template>
  <section>
    <h1 class="text-2xl font-bold">Home</h1>
    <p class="text-base-content/70 mt-2">Overview of your comic library.</p>
  </section>
</template>
