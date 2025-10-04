<script setup lang="ts">

</script>

<template>
	<header class="flex justify-between items-center mb-4 bg-amber-400">
		<div id="top-bar-left">
			<div>
				<p>Welcome, User!</p>
			</div>
		</div>
		<div id="top-bar-right" class="flex-grow ml-auto max-w-lg">
			<InputGroup class="bg-blue-100">
				<InputText placeholder="Keyword" />
				<InputGroupAddon>
					<i class="pi pi-search" />
				</InputGroupAddon>
			</InputGroup>
		</div>
	</header>
</template>