<script setup lang="ts">
import { authClient } from "~/utils/auth-client";

const { data: status, refresh: refreshStatus } = await useFetch("/api/auth-status");

const isAdminRegistered = computed(() => status.value?.hasAdmin ?? true);
const mode = computed<"login" | "register">(() =>
  isAdminRegistered.value ? "login" : "register",
);

const session = authClient.useSession();
const isSignedIn = computed(() => !!session.value?.data?.user);

const name = ref("");
const email = ref("");
const password = ref("");
const errorMessage = ref<string | null>(null);
const isSubmitting = ref(false);
const justRegistered = ref(false);

async function submit() {
  errorMessage.value = null;
  isSubmitting.value = true;
  try {
    const { error } =
      mode.value === "login"
        ? await authClient.signIn.email({
            email: email.value,
            password: password.value,
          })
        : await authClient.signUp.email({
            name: name.value,
            email: email.value,
            password: password.value,
          });

    if (error) {
      errorMessage.value = error.message ?? "Something went wrong. Please try again.";
      return;
    }

    if (mode.value === "register") {
      justRegistered.value = true;
      await refreshStatus();
    }
  } finally {
    isSubmitting.value = false;
  }
}

async function signOut() {
  await authClient.signOut();
  justRegistered.value = false;
  await refreshStatus();
}
</script>

<template>
  <main class="page">
    <div class="card">
      <!-- Signed-in state -->
      <template v-if="isSignedIn">
        <h1>Welcome back</h1>
        <p class="muted">Signed in as <strong>{{ session?.data?.user.email }}</strong></p>
        <p v-if="session?.data?.user.admin" class="badge">Admin</p>
        <NuxtLink to="/" class="button">Continue to home</NuxtLink>
        <button type="button" class="button secondary" @click="signOut">Sign out</button>
      </template>

      <!-- Auth forms -->
      <template v-else>
        <h1>{{ mode === "register" ? "Create your account" : "Sign in" }}</h1>
        <p class="muted">
          {{
            mode === "register"
              ? "You are the first user — this account will become the admin."
              : "Sign in to your account."
          }}
        </p>

        <p v-if="justRegistered" class="success">
          Account created. Please sign in to continue.
        </p>

        <form class="form" @submit.prevent="submit">
          <label v-if="mode === 'register'" for="name">Name</label>
          <input
            v-if="mode === 'register'"
            id="name"
            v-model="name"
            type="text"
            autocomplete="name"
            required
            placeholder="Your name"
          />

          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
          />

          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
            required
            :minlength="8"
            placeholder="••••••••"
          />

          <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

          <button type="submit" class="button" :disabled="isSubmitting">
            {{ isSubmitting ? "Please wait…" : mode === "register" ? "Register" : "Sign in" }}
          </button>
        </form>
      </template>
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
  margin: 0 0 1.25rem;
  font-size: 0.875rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

input {
  border: 1px solid #d4d4d8;
  border-radius: 0.5rem;
  padding: 0.55rem 0.75rem;
  font-size: 0.95rem;
}

input:focus {
  outline: 2px solid #7c3aed;
  outline-offset: 1px;
  border-color: transparent;
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

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button.secondary {
  background: #f4f4f5;
  color: #18181b;
  border: 1px solid #d4d4d8;
}

.error {
  color: #dc2626;
  font-size: 0.85rem;
  margin: 0.5rem 0 0;
}

.success {
  color: #16a34a;
  font-size: 0.875rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin: 0 0 0.75rem;
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
</style>
