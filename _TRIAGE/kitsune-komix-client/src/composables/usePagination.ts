import { computed, type Ref, ref } from 'vue';

export type PaginationPage = number | 'ellipsis';

type PaginationMeta = {
  count: number;
  hasNextPage: boolean;
  currentPage: number;
};

export function usePagination(pageSize: Ref<number>) {
  const currentPage = ref(1);
  const totalCount = ref(0);
  const hasNextPage = ref(false);

  const hasEstimatedPagination = computed(() => hasNextPage.value || currentPage.value > 1);

  const totalPages = computed(() =>
    totalCount.value > 0 ? Math.ceil(totalCount.value / pageSize.value) : 0,
  );

  const displayTotalPages = computed(() => {
    if (totalPages.value > 1) return totalPages.value;
    if (hasEstimatedPagination.value) {
      return currentPage.value + (hasNextPage.value ? 1 : 0);
    }
    return totalPages.value;
  });

  const visiblePages = computed((): PaginationPage[] => {
    const total = displayTotalPages.value;
    if (total <= 1) return total === 1 ? [1] : [];

    const current = currentPage.value;
    const delta = 2;
    const pages = new Set<number>();
    pages.add(1);
    pages.add(total);

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      pages.add(i);
    }

    const sorted = [...pages].sort((a, b) => a - b);
    const result: PaginationPage[] = [];

    for (let i = 0; i < sorted.length; i++) {
      result.push(sorted[i]);
      if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
        result.push('ellipsis');
      }
    }

    return result;
  });

  const setPageResult = (meta: PaginationMeta, fallbackPage: number) => {
    totalCount.value = meta.count;
    hasNextPage.value = meta.hasNextPage;
    currentPage.value = meta.currentPage || fallbackPage;
  };

  return {
    currentPage,
    displayTotalPages,
    hasNextPage,
    setPageResult,
    totalCount,
    visiblePages,
  };
}
