<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  import { useAuthStore } from '@/stores/auth';

  import LoadingLoginForm from '@/components/LoadingLoginForm.vue';
  import SetupSignUpForm from '@/components/SetupSignUpForm.vue';
  import LoginForm from '@/components/LoginForm.vue';

  const authStore = useAuthStore();

  const showSetupForm = ref(false);
  const checkingSetup = ref(true);

  // Check if app needs initial setup
  onMounted(async () => {
    const isSetup = await authStore.checkAppSetup();
    showSetupForm.value = !isSetup;
    checkingSetup.value = false;
  });

</script>

<template>
  <div id="login-page" class="flex justify-center items-center h-screen bg-gray-600">
    
    <!-- Loading state while checking setup -->
    <div v-if="checkingSetup" class="w-full max-w-md">
      <LoadingLoginForm />
    </div>

    <!-- Initial Setup Form -->
    <div v-else-if="showSetupForm" class="w-full max-w-md">
      <SetupSignUpForm v-model:showSetupForm="showSetupForm" />
    </div>

    <!-- Login Form -->
    <div v-else class="w-full max-w-md">
      <LoginForm />
    </div>
  </div>
</template>

<style scoped>
</style>
