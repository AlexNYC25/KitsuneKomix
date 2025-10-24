<script setup lang="ts">
	defineProps(['comicMetadataDetailsLabel', 'comicMetadataDetails'])
</script>

<template>
  <div class="font-bold">{{ comicMetadataDetailsLabel }}:&nbsp;</div>
		<div 
			v-for="(value, index) in comicMetadataDetails?.split(',')" 
			:key="index"
			class="comic-series-page-detail-item"
		>
			<div>{{ value }},&nbsp;</div>
	</div>
</template>