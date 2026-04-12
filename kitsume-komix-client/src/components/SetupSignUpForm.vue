<script setup lang="ts">
	import { ref } from 'vue';
	import { useForm } from 'vee-validate';

	import { useAuthStore } from '@/stores/auth';

	import { validateSignup } from '@/zod/signup.schema.ts';

	const authStore = useAuthStore();

	defineProps<{
		showSetupForm: boolean;
	}>();

	const emit = defineEmits<{
		'update:showSetupForm': [value: boolean];
	}>();

	const setupError = ref<string | null>(null);

	const {
		defineField: defineSignupField,
		handleSubmit: handleSignupSubmit, 
		isSubmitting: isSignupSubmitting,
		resetForm: resetSignupForm,
	} = useForm({
		validationSchema: validateSignup,
		initialValues: {
			email: '',
			password: '',
			confirmPassword: '',
		}
	});

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
				emit('update:showSetupForm', false);
			} else {
				setupError.value = authStore.error || 'Initial setup failed. Please try again.';
			}
		} catch (error: any) {
			setupError.value = error.message || 'An error occurred during signup.';
		}

	});

	const [email, emailAttrs] = defineSignupField('email')
	const [password, passwordAttrs] = defineSignupField('password')
	const [confirmPassword, confirmPasswordAttrs] = defineSignupField('confirmPassword')

</script>

<template>
	<div class="bg-slate-900 shadow-lg p-8">

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
				<label for="signup-password" class="block text-sm font-medium text-white mb-1">Password</label>
				<input
					id="signup-password"
					v-model="password"
					type="password"
					placeholder="Enter your password"
					class="w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors duration-200"
					:class="passwordAttrs.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'"
				/>
				<p v-if="passwordAttrs.error" class="mt-1 text-sm text-red-500">{{ passwordAttrs.error }}</p>
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
					:class="confirmPasswordAttrs.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'"
				/>
				<p v-if="confirmPasswordAttrs.error" class="mt-1 text-sm text-red-500">{{ confirmPasswordAttrs.error }}</p>
			</div>

			<!-- Submit Button -->
			<button
				type="submit"
				:disabled="isSignupSubmitting"
				class="w-full px-4 py-2 my-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-md transition-colors duration-200"
			>
				{{ isSignupSubmitting ? 'Setting up...' : 'Complete Setup' }}
			</button>
		</form>

	</div>
</template>