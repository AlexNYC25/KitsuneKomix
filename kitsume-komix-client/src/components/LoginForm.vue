<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { useForm, useField } from 'vee-validate';
	import { useRouter, useRoute } from 'vue-router';

	import { useAuthStore } from '@/stores/auth';
	import { loadFromStorage, saveToStorage } from '@/utilities/storage';

	import { validateEmailPassword } from '@/zod/login.schema.ts';

	const router = useRouter();
	const route = useRoute();	
	const authStore = useAuthStore();

	const loginFormMessage = ref<string | null>(null);

	const REMEMBERED_USERNAME_STORAGE_KEY = 'kitsune_remembered_username';

	onMounted(async () => {
		
		const rememberedUsername = loadFromStorage<string>(REMEMBERED_USERNAME_STORAGE_KEY, '');
		if (rememberedUsername) {
			setLoginFieldValue('email', rememberedUsername);
			rememberMe.value = true;
		}
	});

	const { 
		handleSubmit: handleLoginSubmit, 
		isSubmitting: isLoginSubmitting,
		defineField: defineLoginField,
		setFieldValue: setLoginFieldValue,
	} = useForm({
		validationSchema: validateEmailPassword,
		initialValues: {
			email: '',
			password: '',
		}
	});

	const [email, emailAttrs] = defineLoginField('email')
	const [password, passwordAttrs] = defineLoginField('password')
	const rememberMe = ref(false);

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
</script>

<template>
	<div class="bg-slate-900 shadow-lg p-8 rounded-lg">
		<div class="flex justify-center mb-6">
			<h1 class="text-2xl font-bold text-white">
				Kitsune Komix Login
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
					v-model="email"
					type="email"
					placeholder="Enter your email"
					class="w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors duration-200"
					:class="emailAttrs.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'"
				/>
				<p v-if="emailAttrs.error" class="mt-1 text-sm text-red-500">{{ emailAttrs.error }}</p>
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
					:class="passwordAttrs.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'"
				/>
				<p v-if="passwordAttrs.error" class="mt-1 text-sm text-red-500">{{ passwordAttrs.error }}</p>
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
</template>