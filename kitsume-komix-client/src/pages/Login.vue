<script setup lang="ts">

import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useForm, useField } from 'vee-validate';

import { useAuthStore } from '@/stores/auth';

import { validateEmailPassword } from '@/zod/login.schema.ts';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Define validation schema with Zod
const validationSchema = validateEmailPassword;

// Setup form with vee-validate
const { handleSubmit, isSubmitting } = useForm({
  validationSchema,
  initialValues: {
    email: '',
    password: '',
  }
});

// Setup individual fields
const { value: email, errorMessage: emailError } = useField('email');
const { value: password, errorMessage: passwordError } = useField('password');

const rememberMe = ref(false);

// Handle form submission
const loginFormSubmit = handleSubmit(async (values) => {
  try {
    const success = await authStore.login({
      username: values.email,
      password: values.password,
      rememberMe: rememberMe.value
    });

    if (success) {
      const redirect = (route.query.redirect as string) || '/';
      router.push(redirect);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
});
</script>

<template>
  <div id="login-page" class="flex justify-center items-center h-screen bg-gray-600">
    <div class="bg-black shadow-lg p-8 rounded-lg w-full max-w-md">
      <div class="flex justify-center mb-6">
        <h1 class="text-2xl font-bold text-white">
          Kistume Komix Login
        </h1>
      </div>
      
      <form @submit="loginFormSubmit" class="space-y-4">
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-white mb-1">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors duration-200"
            :class="emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'"
          />
          <p v-if="emailError" class="mt-1 text-sm text-red-500">{{ emailError }}</p>
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-white mb-1">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors duration-200"
            :class="passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'"
          />
          <p v-if="passwordError" class="mt-1 text-sm text-red-500">{{ passwordError }}</p>
        </div>

        <!-- Remember Me Checkbox -->
        <div class="flex items-center">
          <input
            id="rememberMe"
            v-model="rememberMe"
            type="checkbox"
            class="w-4 h-4 accent-blue-500 bg-gray-700 border-gray-600 rounded cursor-pointer"
          />
          <label for="rememberMe" class="ml-2 text-sm text-white cursor-pointer">
            Remember Me
          </label>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-md transition-colors duration-200"
        >
          {{ isSubmitting ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>
