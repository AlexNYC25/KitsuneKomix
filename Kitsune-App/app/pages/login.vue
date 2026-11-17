<script setup lang="ts">
import { authClient } from "~/utils/auth-client";

definePageMeta({ layout: false });

const { data: status, refresh: refreshStatus } = await useFetch("/api/auth-status");

const isAdminRegistered = computed(() => status.value?.hasAdmin ?? true);
const mode = computed<"login" | "register">(() =>
  isAdminRegistered.value ? "login" : "register",
);

const session = authClient.useSession();
const isSignedIn = computed(() => !!session.value?.data?.user);

// Signed-in users don't belong on the login page — send them home
// as soon as the session resolves (immediately if already known).
watch(
  isSignedIn,
  (signedIn) => {
    if (signedIn) navigateTo("/");
  },
  { immediate: true },
);

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

</script>

<template>
  <main class="flex justify-center items-center min-h-screen">
    <div class="card w-96 bg-base-100 shadow-sm border-solid border-2 border-blue-500">
      <div class="card-body">
        <div class="flex flex-col gap-2">
            <h1 class="text-2xl font-bold mb-2 justify-center">
              {{ mode === "register" ? "Create your account" : "Sign in" }}
            </h1>

            <p class="text-sm text-gray-400 mb-2">
              {{
                mode === "register"
                  ? "You are the first user — this account will become the admin."
                  : "Sign in to your account."
              }}
            </p>

            <div v-if="justRegistered" class="flex items-center justify-center">
              <p class="text-sm text-green-500 mb-2">
                Account created. Please sign in to continue.
              </p>
            </div>
            

            <form class="form flex-col" @submit.prevent="submit">
              <div v-if="mode === 'register'" class="mb-4">
                <label v-if="mode === 'register'" for="name" class="block text-white-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  v-if="mode === 'register'"
                  id="name"
                  v-model="name"
                  type="text"
                  autocomplete="name"
                  required
                  placeholder="Your name"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div class="mb-4">
                <label for="email" class="block text-white-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="you@example.com"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>              

              <div class="mb-4">
                <label for="password" class="block text-white-700 text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
                  required
                  :minlength="8"
                  placeholder="••••••••"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>              

              <div v-if="errorMessage" class="flex items-center justify-center">
                <p class="text-red-500 text-xs italic" role="alert">{{ errorMessage }}</p>
              </div>
              

              <div class="flex items-center justify-center">
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  {{ isSubmitting ? "Please wait…" : mode === "register" ? "Register" : "Sign in" }}
                </button>
              </div>
              
            </form>
          </div>
      </div>
    </div>
  </main>
</template>
