<script setup lang="ts">

</script>

<template>
	<div
		class="comic-series-page flex flex-col w-full h-full p-4 overflow-auto"
	>
		<div
			class="comic-series-page-details bg-cyan-800 h-120 w-full rounded-2xl flex"
		>
			<!-- Placeholder for ComicSeries details -->
			<div class="comic-series-page-details-thumbnail h-full rounded-l-2xl ">
				<img
					src="https://placehold.co/400x600/grey/white?text=Comic+Series+Thumbnail"
					alt="Comic Series Thumbnail"
					class="object-contain h-full pl-5 py-5"
				/>
			</div>

			<div 
				class="comic-series-page-details-info h-full m-6"
			>
				<div class="comic-series-page-details-title text-shadow-lg font-bold text-4xl">
					Comic Series Title
				</div>
			</div>
		</div>

		<div
			class="comic-series-page-contents"
		>
			<!-- Placeholder for ComicSeries contents such as list of comics -->
			<div>

			</div>
		</div>
	</div>
</template>