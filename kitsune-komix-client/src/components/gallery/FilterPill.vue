<script setup lang="ts">
import AppIcon from '../icons/AppIcon.vue';

defineProps<{
	item: {
		id: number | string
		name: string
	}
}>();

const emit = defineEmits<{
	remove: []
}>();
</script>

<template>
	<span class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-xs text-text-primary">
		{{ item.name }}
		<button
			type="button"
			@click="emit('remove')"
			class="leading-none hover:text-red-400"
			aria-label="Remove"
		>
			<AppIcon name="remove" scale="0.8" />
		</button>
	</span>
</template>