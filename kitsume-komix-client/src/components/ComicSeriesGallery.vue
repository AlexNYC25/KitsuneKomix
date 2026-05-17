<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';

import { useComicSeriesStore } from '@/stores/comic-series';

import ComicSeriesCard from './ComicSeriesCard.vue';
import AppIcon from './icons/AppIcon.vue';

import type { ComicSeriesListItem } from '@/types';

const comics = ref<ComicSeriesListItem[]>([]);

const showFilters = ref(false);
const filtersApplied = ref({
	genre: [] as string[],
	status: [] as string[],
	rating: [] as string[],
});

const sortCategory = ref("latest");

const areThereActiveFilters = computed(() => {
	return Object.values(filtersApplied.value).some(filterArray => filterArray.length > 0);
});

onMounted(async () => {
	const comicSeriesStore = useComicSeriesStore();
	const data = await comicSeriesStore.fetchComicSeriesList(1, 20, "latest");
	comics.value = data || [];
})
</script>

<template>
	<div class=" w-full h-full flex flex-col bg-surface">
		<!-- Options and filter toolbar -->
		<div class="w-lwh h-14 mx-5 mt-7 bg-surface-elevated border border-white/10 flex items-center justify-between px-4" :class="{ 'rounded-b-none': showFilters, 'rounded-xl': !showFilters, 'rounded-t-xl': showFilters }">
			<div class="flex items-center gap-3">
				<button
					type="button"
					@click="showFilters = !showFilters"
					class="px-3 py-1.5 rounded-md bg-black/40 text-text-primary text-sm font-medium border border-white/15 hover:bg-black/60 transition-colors"
				>
					<AppIcon v-if="areThereActiveFilters" name="filter" scale="0.8" class="mr-1" />
					<AppIcon v-else name="filterOff" scale="0.8" class="mr-1" />
					Filters
				</button>
				<label for="sort-by" class="text-sm text-text-secondary">Sort by</label>
				<select
					id="sort-by"
					class="px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
				>
					<option value="latest">Latest</option>
					<option value="updated">Recently Updated</option>
					<option value="name">Name</option>
				</select>
			</div>

			<div class="flex items-center gap-2">
				<button
					type="button"
					aria-label="Grid view"
					class="w-9 h-9 rounded-md bg-black/40 border border-white/15 text-text-primary text-sm"
				>
					<AppIcon name="grid" scale="0.8" />
				</button>
				<button
					type="button"
					aria-label="List view"
					class="w-9 h-9 rounded-md bg-black/40 border border-white/15 text-text-primary text-sm"
				>
					<AppIcon name="list" scale="0.8" />
				</button>
				<span class="ml-2 text-sm text-text-secondary">{{ comics.length }} series</span>
			</div>
			
		</div>

		<!-- Filters panel -->
		<div v-if="showFilters" class="w-lwh mx-5 bg-surface-elevated border border-t-0 border-white/10 rounded-b-xl p-4">
			<div class="grid grid-cols-6 gap-4">
				<!-- Filter Column - Genre -->
				<div class="flex flex-col gap-2 bg-surface-overlay/80 p-3 rounded-lg">
					<label class="text-xs font-semibold text-text-primary uppercase">
						<AppIcon name="genreCheck" scale="0.8" class="mr-1" />
						Genre
					</label>
					<div class="border border-white/70 rounded p-2 flex items-center justify-center text-sm text-text-secondary">
						All Genres
					</div>
					<div class="space-y-2 text-sm text-text-secondary">
						<div><input type="checkbox" id="genre-action" /> <label for="genre-action">Action</label></div>
						<div><input type="checkbox" id="genre-comedy" /> <label for="genre-comedy">Comedy</label></div>
						<div><input type="checkbox" id="genre-drama" /> <label for="genre-drama">Drama</label></div>
					</div>
				</div>

				<!-- Filter Column - Series Status -->
				<div class="flex flex-col gap-2 bg-surface-overlay/80 p-3 rounded-lg">
					<label class="text-xs font-semibold text-text-primary uppercase">
						<AppIcon name="seriesStatus" scale="0.8" class="mr-1" />
						Status
					</label>
					<div class="border border-white/70 rounded p-2 flex items-center justify-center text-sm text-text-secondary">
						All Status
					</div>
					<div class="space-y-2 text-sm text-text-secondary">
						<div><input type="checkbox" id="status-ongoing" /> <label for="status-ongoing">Ongoing</label></div>
						<div><input type="checkbox" id="status-completed" /> <label for="status-completed">Completed</label></div>
						<div><input type="checkbox" id="status-hiatus" /> <label for="status-hiatus">On Hiatus</label></div>
					</div>
				</div>

				<!-- Filter Column - Ratings -->
				<div class="flex flex-col gap-2 bg-surface-overlay/80 p-3 rounded-lg">
					<label class="text-xs font-semibold text-text-primary uppercase">
						<AppIcon name="star" scale="0.8" class="mr-1" />
						All Rating
					</label>
					<div class="border border-white/70 rounded p-2 flex items-center justify-center text-sm text-text-secondary">
						All Ratings
					</div>
					<div class="space-y-2 text-sm text-text-secondary">
						<div><input type="checkbox" id="rating-5star" /> <label for="rating-5star">5★+</label></div>
						<div><input type="checkbox" id="rating-4star" /> <label for="rating-4star">4★+</label></div>
						<div><input type="checkbox" id="rating-3star" /> <label for="rating-3star">3★+</label></div>
					</div>
				</div>

				<!-- Filter Column - Years -->
				<div class="flex flex-col gap-2 bg-surface-overlay/80 p-3 rounded-lg">
					<label class="text-xs font-semibold text-text-primary uppercase">
						<AppIcon name="calendar" scale="0.8" class="mr-1" />
						Year
					</label>
					<div class="border border-white/70 rounded p-2 flex items-center justify-center text-sm text-text-secondary">
						All Years
					</div>
					<div class="space-y-2 text-sm text-text-secondary">
						<div><input type="checkbox" id="year-2024" /> <label for="year-2024">2024</label></div>
						<div><input type="checkbox" id="year-2023" /> <label for="year-2023">2023</label></div>
						<div><input type="checkbox" id="year-2022" /> <label for="year-2022">2022</label></div>
					</div>
				</div>

				<!-- Filter Column - Content -->
				<div class="flex flex-col gap-2 bg-surface-overlay/80 p-3 rounded-lg">
					<label class="text-xs font-semibold text-text-primary uppercase">
						<AppIcon name="bookContent" scale="0.8" class="mr-1" />
						Contents
					</label>

					<div class="text-sm text-text-secondary">
						Characters
					</div>
					<input type="text" placeholder="Search characters..." class="w-full px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none" />

					<div class="text-sm text-text-secondary">
						Teams
					</div>
					<input type="text" placeholder="Search teams..." class="w-full px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none" />

					<div class="text-sm text-text-secondary">
						Locations
					</div>
					<input type="text" placeholder="Search locations..." class="w-full px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none" />
				</div>

				<!-- Filter Column Creators -->
				<div class="flex flex-col gap-2 bg-surface-overlay/80 p-3 rounded-lg">
					<label class="text-xs font-semibold text-text-primary uppercase">
						<AppIcon name="edit" scale="0.8" class="mr-1" />
						Creators
					</label>
					<div class="space-y-2 text-sm text-text-secondary">
						<div class="text-sm text-text-secondary">
							Written by
						</div>
						<input type="text" placeholder="Search writers..." class="w-full px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none" />

						<div class="text-sm text-text-secondary">
							Illustrated by=
						</div>
						<input type="text" placeholder="Search artists..." class="w-full px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none" />

						<div class="text-sm text-text-secondary">
							Published by
						</div>
						<input type="text" placeholder="Search publishers..." class="w-full px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none" />

						<div class="text-sm text-text-secondary">
							Colored by
						</div>
						<input type="text" placeholder="Search colorists..." class="w-full px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none" />

						<div class="text-sm text-text-secondary">
							Lettered by
						</div>
						<input type="text" placeholder="Search letterers..." class="w-full px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none" />

						<div class="text-sm text-text-secondary">
							Edited by
						</div>
						<input type="text" placeholder="Search editors..." class="w-full px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none" />

						<div class="text-sm text-text-secondary">
							Cover by
						</div>
						<input type="text" placeholder="Search cover artists..." class="w-full px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none" />
					</div>
				</div>
			</div>
		</div>

		<!-- Main content area -->
		<div class="flex-1 p-4 mx-6">
			<div class="grid grid-cols-5 gap-4">
				<ComicSeriesCard v-for="comic in comics" :key="comic.id" :comicSeriesData="comic" />
			</div>
		</div>
	</div>
</template>