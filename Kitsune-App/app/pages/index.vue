<script setup lang="ts">
import { authClient } from "~/utils/auth-client";

definePageMeta({ middleware: "require-auth" });

const { data: session } = await authClient.useSession(useFetch);
const user = computed(() => session.value?.user);

async function signOut() {
  await authClient.signOut();
  await navigateTo("/login");
}
</script>

<template>
  <main class="page">
    <div class="card">
      <h1>Kitsune Komix</h1>
      <p class="muted">Signed in as <strong>{{ user?.email }}</strong></p>
      <p v-if="user?.admin" class="badge">Admin</p>
      <button type="button" class="button" @click="signOut">Sign out</button>
    </div>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f5;
  padding: 1rem;
}

.card {
  width: 100%;
  max-width: 24rem;
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
}

h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
}

.muted {
  color: #71717a;
  margin: 0 0 1rem;
  font-size: 0.875rem;
}

.badge {
  display: inline-block;
  background: #f5f3ff;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
  border-radius: 999px;
  padding: 0.1rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.button {
  margin-top: 1rem;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  cursor: pointer;
}

.button:hover {
  background: #6d28d9;
}
</style>
