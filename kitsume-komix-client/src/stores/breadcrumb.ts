import { defineStore } from 'pinia'

export const useBreadcrumbStore = defineStore('breadcrumb', {
  state: () => ({
    comicBookSeriesId: undefined as number | undefined,
    comicBookTitle: '' as string,
  }),
  actions: {
    setComicBookData(seriesId: number | undefined, title: string) {
      this.comicBookSeriesId = seriesId
      this.comicBookTitle = title
    },
    clearComicBookData() {
      this.comicBookSeriesId = undefined
      this.comicBookTitle = ''
    }
  }
})
