<script setup lang="ts">

defineProps<{
	label: string,
	iconName: string
}>();
</script>

<template>
	<div class="flex flex-col gap-2 bg-surface-overlay/80 p-3 rounded-lg"">
		<label class="text-xs font-semibold text-text-primary uppercase">
			<AppIcon :name="iconName" scale="0.8" class="mr-1" />
			{{ label }}
		</label>

		<slot />
	</div>
</template>