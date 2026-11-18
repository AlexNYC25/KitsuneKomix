<script setup lang="ts">
import { authClient } from "~/utils/auth-client";

const { data: session } = await authClient.useSession(useFetch);
const user = computed(() => session.value?.user);

const drawerOpen = ref(false);

async function signOut() {
  drawerOpen.value = false;
  await authClient.signOut();
  await navigateTo("/login");
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Top bar -->
    <header class="bg-base-200 sticky top-0 z-40 flex h-14 items-center gap-2 px-4 lg:pl-72">
      <button
        type="button"
        class="btn btn-square btn-ghost lg:hidden"
        aria-label="Toggle navigation"
        @click="drawerOpen = !drawerOpen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="font-semibold">Kitsune Komix</div>
    </header>

    <!-- Mobile overlay -->
    <div
      v-if="drawerOpen"
      class="bg-black/30 fixed inset-0 z-40 lg:hidden"
      aria-hidden="true"
      @click="drawerOpen = false"
    />

    <!-- Sidebar, overlaying the content -->
    <aside
      class="bg-base-200 fixed inset-y-0 left-0 z-50 flex w-64 flex-col p-4 transition-transform duration-200 lg:translate-x-0"
      :class="drawerOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-2 text-xl font-bold">Kitsune Komix</div>

      <ul class="menu w-full flex-1">
        <li>
          <NuxtLink to="/" exact-active-class="menu-active" @click="drawerOpen = false">Home</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/comics" active-class="menu-active" @click="drawerOpen = false">Comics</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/settings" active-class="menu-active" @click="drawerOpen = false">Settings</NuxtLink>
        </li>
      </ul>

      <div class="border-base-300 border-t p-2">
        <div class="truncate text-sm opacity-60">{{ user?.email }}</div>
        <p v-if="user?.admin" class="badge badge-primary badge-sm mt-1">Admin</p>
        <button type="button" class="btn btn-ghost btn-sm mt-2 w-full" @click="signOut">Sign out</button>
      </div>
    </aside>

    <!-- Content -->
    <main class="p-6 lg:pl-72">
      <slot />
    </main>
  </div>
</template>
