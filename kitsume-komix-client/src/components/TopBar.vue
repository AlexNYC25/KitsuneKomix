<script setup lang="ts">

</script>

<template>
	<header class="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
		<div id="top-bar-left">
			<div>
				<p class="text-white font-semibold">Welcome, User!</p>
			</div>
		</div>
		<div id="top-bar-right" class="flex-shrink ml-auto max-w-lg">
			<InputGroup class="bg-gray-700">
				<InputText placeholder="Keyword" class="bg-gray-700 text-white placeholder-gray-400" />
				<InputGroupAddon class="bg-gray-700">
					<i class="pi pi-search text-gray-400" />
				</InputGroupAddon>
			</InputGroup>
		</div>
	</header>
</template>