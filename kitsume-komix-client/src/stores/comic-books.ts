import { defineStore } from "pinia";

export const useComicBooksStore = defineStore("comicBooks", {
	state: () => ({
		comicBooksFilterValuesCache: new Map<number, any>(),
	}),
	getters: {

	},
	actions: {

	}
});