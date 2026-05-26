import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { ROUTE_SORT_CATEGORY_MAP } from '@/config/gallery';

export function useGallerySort() {
  const route = useRoute();
  const sortCategory = ref('');

  const isLatestRoute = computed(() => route.path === '/comic-series/latest' || route.path === '/comic-books/latest');
  const isListRoute = computed(() => route.path === '/comic-series/list' || route.path === '/comic-books/list');



  watch(
    () => route.path,
    (newPath) => {
      sortCategory.value = ROUTE_SORT_CATEGORY_MAP[newPath] ?? sortCategory.value;
    },
    { immediate: true },
  );

  return {
    isLatestRoute,
    isListRoute,
    sortCategory,
  };
}
