<script setup lang="ts">
defineProps<{
  name: string
  scale?: number | string
}>()

defineOptions({ inheritAttrs: false })

const piToOh: Record<string, string> = {
  bars: 'io-menu',
  search: 'io-search',
  sun: 'io-sunny',
  moon: 'io-moon',
  'chevron-left': 'io-chevron-back',
  'chevron-right': 'io-chevron-forward',
  book: 'io-book',
  check: 'io-checkmark',
  download: 'io-download',
  plus: 'io-add-circle',
  home: 'la-home-solid',
  image: 'io-image',
  times: 'io-close',
  pencil: 'io-pencil-sharp',
  trash: 'io-trash',
  'arrow-up': 'io-arrow-up',
  list: 'md-list',
  grid: 'md-gridview-sharp',
  filter: 'md-filteralt',
  filterOff: 'md-filteraltoff',
}

</script>

<template>
  <v-icon :name="piToOh[name] || name" :scale="scale" v-bind="$attrs" />
</template>
