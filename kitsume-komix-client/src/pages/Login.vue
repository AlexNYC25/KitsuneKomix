<script setup lang="ts">
import type { FormFieldState, FormSubmitEvent } from '@primevue/forms';


import { reactive } from 'vue';
import { z } from 'zod';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';

import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';

const initialFormData = reactive({
    email: '',
    password: '',
    rememberMe: false
});

const validateForm = zodResolver(
  z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" })
  })
);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loginFormSubmit = async (event: FormSubmitEvent) => {
  const success = await authStore.login({username: event.states.email.value, password: event.states.password.value});
  if (success) {
    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  }
};
</script>

<template>
  <div id="login-page" class="flex justify-center items-center h-screen bg-gray-600">
    <div class="card bg-black shadow-lg p-6 rounded-lg">
      <div class="flex justify-center mb-4">
        <h1 class="text-2xl font-bold mb-4 text-white">
          Kistume Komix Login
        </h1>
      </div>
      <Form v-slot="$form" :formData="initialFormData" :resolver="validateForm" @submit="loginFormSubmit" class="flex justify-center flex-col gap-4">
        <div class="flex flex-col gap-1">
            <InputText name="email" placeholder="Email" />
            <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error.message }}</Message>
        </div>
        <div class="flex flex-col gap-1">
            <Password name="password" placeholder="Password" :feedback="false" toggleMask fluid/>
            <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{ $form.password.error.message }}</Message>
        </div>
        <div class="flex align-items-center">
          <Checkbox v-model="initialFormData.rememberMe" />
          <label class="ml-2 text-white">Remember Me</label>
        </div>
        <Button type="submit" label="Submit" />
      </Form>
    </div>
  </div>
</template>

<style scoped>
</style>
