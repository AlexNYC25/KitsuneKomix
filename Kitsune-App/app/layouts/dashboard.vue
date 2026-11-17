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
  <div class="drawer lg:drawer-open" :class="{ 'drawer-open': drawerOpen }">
    <!-- daisyUI's drawer CSS needs this structural child to open/close the drawer -->
    <input
      id="app-drawer"
      type="checkbox"
      class="drawer-toggle"
      :checked="drawerOpen"
      @change="drawerOpen = ($event.target as HTMLInputElement).checked"
    />

    <div class="drawer-content">
      <!-- Mobile top bar -->
      <div class="navbar bg-base-200 lg:hidden">
        <div class="flex-none">
          <label for="app-drawer" class="btn btn-square btn-ghost" aria-label="Toggle navigation">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
        </div>
        <div class="mx-2 font-semibold">Kitsune Komix</div>
      </div>

      <main class="p-6">
        <slot />
      </main>
    </div>

    <!-- Sidebar -->
    <div class="drawer-side">
      <label for="app-drawer" class="drawer-overlay" aria-label="Close navigation" />
      <aside class="bg-base-200 min-h-full w-64 flex flex-col p-4">
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
    </div>
  </div>
</template>
