<script setup lang="ts">
import { ErrorMessage, Field, Form } from 'vee-validate';
</script>

<template>
  <div id="login-form" class="flex w-full flex-1 items-center justify-center px-4">
    <div class="rounded-2xl bg-grey p-8 shadow-xl shadow-zinc-900/10 ring-1 ring-zinc-950/5">
      <h1 class="mb-1 text-2xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
      <p class="mb-6 text-sm text-zinc-500">Sign in to your account to continue</p>

      <Form class="space-y-5">
        <div>
          <label for="email" class="mb-1.5 block text-sm font-medium text-zinc-700">Email</label>
          <Field
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            class="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10"
          />
          <ErrorMessage name="email" class="mt-1.5 block text-sm text-red-600" />
        </div>

        <div>
          <label for="password" class="mb-1.5 block text-sm font-medium text-zinc-700">Password</label>
          <Field
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10"
          />
          <ErrorMessage name="password" class="mt-1.5 block text-sm text-red-600" />
        </div>

        <button
          type="submit"
          class="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-4 focus:ring-zinc-900/20 active:scale-[0.98]"
        >
          Login
        </button>
      </Form>
    </div>
  </div>
</template>
