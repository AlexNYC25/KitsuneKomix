<script setup lang="ts">
import AppIcon from '../icons/AppIcon.vue';

defineProps<{
	property: {
		id: number | string
		name: string
	},
	isSelected?: boolean
}>();

const emit = defineEmits<{
	toggle: []
	untoggle: []
}>();

const handleClick = (isSelected: boolean | undefined) => {
	if (isSelected) {
		emit('untoggle');
	} else {
		emit('toggle');
	}
};
</script>

<template>
	<label
		class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
	>
		<button
			type="button"
			@click.prevent="handleClick(isSelected)"
			class="p-0 border-0 bg-transparent cursor-pointer"
		>
			<AppIcon
				:name="isSelected ? 'remove' : 'add'"
				scale="0.8"
				:class="isSelected ? 'text-red-400' : 'text-green-400'"
			/>
		</button>
		{{ property.name }}
	</label>
</template>