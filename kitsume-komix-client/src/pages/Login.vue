<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useForm, useField } from 'vee-validate';

import { useAuthStore } from '@/stores/auth';
import { loadFromStorage, saveToStorage } from '@/utilities/storage';

import { validateEmailPassword } from '@/zod/login.schema.ts';
import { validateSignup } from '@/zod/signup.schema.ts';

import LoadingLoginForm from '@/components/LoadingLoginForm.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const showSetupForm = ref(false);
const checkingSetup = ref(true);

const loginFormMessage = ref<string | null>(null);
const REMEMBERED_USERNAME_STORAGE_KEY = 'kitsune_remembered_username';

// Check if app needs initial setup
onMounted(async () => {
  const rememberedUsername = loadFromStorage<string>(REMEMBERED_USERNAME_STORAGE_KEY, '');
  if (rememberedUsername) {
    loginEmail.value = rememberedUsername;
    rememberMe.value = true;
  }

  const isSetup = await authStore.checkAppSetup();
  showSetupForm.value = !isSetup;
  checkingSetup.value = false;
});

// LOGIN FORM SETUP
// Define validation schema with Zod
const loginValidationSchema = validateEmailPassword;

// Setup login form with vee-validate
const { handleSubmit: handleLoginSubmit, isSubmitting: isLoginSubmitting } = useForm({
  validationSchema: loginValidationSchema,
  initialValues: {
    email: '',
    password: '',
  }
});

// Setup individual fields for login
const { value: loginEmail, errorMessage: loginEmailError } = useField('email');
const { value: loginPassword, errorMessage: loginPasswordError } = useField('password');

const rememberMe = ref(false);

// Handle login form submission
const loginFormSubmit = handleLoginSubmit(async (values) => {
  try {
    if (rememberMe.value) {
      saveToStorage(REMEMBERED_USERNAME_STORAGE_KEY, values.email);
    } else {
      localStorage.removeItem(REMEMBERED_USERNAME_STORAGE_KEY);
    }

    const success = await authStore.login({
      username: values.email,
      password: values.password,
      rememberMe: rememberMe.value
    });

    if (success) {
      loginFormMessage.value = null;
      const redirect = (route.query.redirect as string) || '/';
      router.push(redirect);
    } else {
      loginFormMessage.value = authStore.error || 'Login failed. Please check your credentials and try again.';
    }
  } catch (error) {
    console.error('Login error:', error);
    loginFormMessage.value = 'An unexpected error occurred during login.';
  }
});

// SIGNUP FORM SETUP
const signupValidationSchema = validateSignup;

// Setup signup form with vee-validate
const signupForm = useForm({
  validationSchema: signupValidationSchema,
  initialValues: {
    email: '',
    password: '',
    confirmPassword: '',
  }
});

const { 
  handleSubmit: handleSignupSubmit, 
  isSubmitting: isSignupSubmitting,
  resetForm: resetSignupForm 
} = signupForm;

// Setup individual fields for signup
const { value: signupEmail, errorMessage: signupEmailError } = useField('email', undefined, { form: signupForm });
const { value: signupPassword, errorMessage: signupPasswordError } = useField('password', undefined, { form: signupForm });
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField('confirmPassword', undefined, { form: signupForm });

const setupError = ref<string | null>(null);

// Handle signup form submission
const signupFormSubmit = handleSignupSubmit(async (values) => {
  setupError.value = null;
  
  try {
    const success = await authStore.initialSetup({
      email: values.email,
      password: values.password
    });

    if (success) {
      // Reset form and switch to login
      resetSignupForm();
      showSetupForm.value = false;
    } else {
      setupError.value = authStore.error || 'Initial setup failed. Please try again.';
    }
  } catch (error) {
    console.error('Setup error:', error);
    setupError.value = 'An unexpected error occurred during setup.';
  }
});
</script>

<template>
  <div id="login-page" class="flex justify-center items-center h-screen bg-gray-600">
    <!-- Loading state while checking setup -->
    <div v-if="checkingSetup" class="w-full max-w-md">
      <LoadingLoginForm />
    </div>

    <!-- Initial Setup Form -->
    <div v-else-if="showSetupForm" class="bg-slate-900 shadow-lg p-8 rounded-lg w-full max-w-md">
      <div class="flex justify-center mb-6">
        <h1 class="text-2xl font-bold text-white">
          Initial Setup
        </h1>
      </div>
      <p class="text-gray-300 text-sm mb-6 text-center">
        Welcome! Let's set up your admin account.
      </p>
      
      <form @submit="signupFormSubmit" class="space-y-4">
        <!-- Setup Error Message -->
        <div v-if="setupError" class="p-3 bg-red-500/20 border border-red-500 rounded-md">
          <p class="text-sm text-red-400">{{ setupError }}</p>
        </div>

        <!-- Email Field -->
        <div>
          <label for="signup-email" class="block text-sm font-medium text-white mb-1">Email</label>
          <input
            id="signup-email"
            v-model="signupEmail"
            type="email"
            placeholder="Enter your email"
            class="w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors duration-200"
            :class="signupEmailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'"
          />
          <p v-if="signupEmailError" class="mt-1 text-sm text-red-500">{{ signupEmailError }}</p>
        </div>

        <!-- Password Field -->
        <div>
          <label for="signup-password" class="block text-sm font-medium text-white mb-1">Password</label>
          <input
            id="signup-password"
            v-model="signupPassword"
            type="password"
            placeholder="Enter your password"
            class="w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors duration-200"
            :class="signupPasswordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'"
          />
          <p v-if="signupPasswordError" class="mt-1 text-sm text-red-500">{{ signupPasswordError }}</p>
        </div>

        <!-- Confirm Password Field -->
        <div>
          <label for="confirm-password" class="block text-sm font-medium text-white mb-1">Confirm Password</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            class="w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors duration-200"
            :class="confirmPasswordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'"
          />
          <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-500">{{ confirmPasswordError }}</p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isSignupSubmitting"
          class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-md transition-colors duration-200"
        >
          {{ isSignupSubmitting ? 'Setting up...' : 'Complete Setup' }}
        </button>
      </form>
    </div>

    <!-- Login Form -->
    <div v-else class="bg-slate-900 shadow-lg p-8 rounded-lg w-full max-w-md">
      <div class="flex justify-center mb-6">
        <h1 class="text-2xl font-bold text-white">
          Kistume Komix Login
        </h1>
      </div>

      <div id="login-message" class="text-gray-300 text-sm mb-6 text-center">
        Please enter your credentials to log in.
        <p v-if="loginFormMessage" class="mt-1 text-sm text-red-500">{{ loginFormMessage }}</p>
      </div>
      
      <form @submit="loginFormSubmit" class="space-y-4">
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-white mb-1">Email</label>
          <input
            id="email"
            v-model="loginEmail"
            type="email"
            placeholder="Enter your email"
            class="w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors duration-200"
            :class="loginEmailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'"
          />
          <p v-if="loginEmailError" class="mt-1 text-sm text-red-500">{{ loginEmailError }}</p>
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-white mb-1">Password</label>
          <input
            id="password"
            v-model="loginPassword"
            type="password"
            placeholder="Enter your password"
            class="w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors duration-200"
            :class="loginPasswordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'"
          />
          <p v-if="loginPasswordError" class="mt-1 text-sm text-red-500">{{ loginPasswordError }}</p>
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
          :disabled="isLoginSubmitting"
          class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-md transition-colors duration-200"
        >
          {{ isLoginSubmitting ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>
