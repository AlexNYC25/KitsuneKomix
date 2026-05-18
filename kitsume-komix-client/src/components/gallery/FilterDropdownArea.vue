<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from '../icons/AppIcon.vue';

defineProps<{
	filterName: string
	byLine: string
	selectLine: string
	noOptionsText?: string
	emptyOptions: boolean
	selectedCount: number
}>();

const showDropdown = ref(false);
</script>

<template>
	<div>
		<div class="text-sm text-text-secondary">
			{{ byLine }}
		</div>
		<div class="relative">
			<button
				type="button"
				@click="showDropdown = !showDropdown"
				class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
			>
				<span class="text-text-secondary/70">
					{{ selectedCount === 0 ? selectLine : `${selectedCount} selected` }}
				</span>
				<AppIcon :name="showDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
			</button>
			<div
				v-if="showDropdown"
				class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
			>
				<div v-if="emptyOptions" class="px-3 py-2 text-xs text-text-secondary/70">
					{{ noOptionsText ?? `No ${filterName} found` }}
				</div>
				<slot name="options" />
			</div>
		</div>
		<div v-if="selectedCount > 0" class="flex flex-wrap gap-1 mt-1">
			<slot name="pills" />
		</div>
	</div>
</template>