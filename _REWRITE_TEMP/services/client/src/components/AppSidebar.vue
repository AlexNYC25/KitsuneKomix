<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const isCollapsed = ref(false)

const navigation = [
  { name: 'Dashboard', path: '/', icon: 'home' },
]
</script>

<template>
  <aside
    :class="[
      'flex h-screen flex-col bg-gray-900 text-white transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Header -->
    <div class="flex h-16 items-center justify-between px-4">
      <span v-if="!isCollapsed" class="text-xl font-bold">
        My Application
      </span>

      <button
        type="button"
        @click="isCollapsed = !isCollapsed"
        class="rounded-lg p-2 hover:bg-gray-700"
        aria-label="Toggle sidebar"
      >
        {{ isCollapsed ? '→' : '←' }}
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-2 px-2 py-4">
      <RouterLink
        v-for="item in navigation"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
        active-class="bg-blue-600 text-white"
      >
        <span class="text-xl">{{ item.icon }}</span>
        <span v-if="!isCollapsed">{{ item.name }}</span>
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="border-t border-gray-700 p-4">
      <span v-if="!isCollapsed" class="text-sm text-gray-400">
        Logged in
      </span>
    </div>
  </aside>
</template>