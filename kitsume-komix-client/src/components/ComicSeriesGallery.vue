<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useComicSeriesStore } from '@/stores/comic-series';

import ComicSeriesCard from './ComicSeriesCard.vue';
import AppIcon from './icons/AppIcon.vue';

import type { ComicSeriesListItem } from '@/types';
import type { ComicSeriesFilterValuesData } from '@/types/comic-series.types';

const comics = ref<ComicSeriesListItem[]>([]);

const showFilters = ref(false);
const filtersAllowed = ref<ComicSeriesFilterValuesData | null>(null);
const filtersApplied = ref({
	genre: [] as string[],
	status: [] as string[],
	rating: [] as string[],
});

const yearFilterOptions = computed(() => filtersAllowed.value?.years ?? []);
const genreFilterOptions = computed(() => {
	const genres = filtersAllowed.value?.genres ?? [];
	return [...genres].sort((a, b) => a.name.localeCompare(b.name));
});
const characterFilterOptions = computed(() => {
	const characters = filtersAllowed.value?.characters ?? [];
	return [...characters].sort((a, b) => a.name.localeCompare(b.name));
});

const selectedCharacters = ref<number[]>([]);
const showCharactersDropdown = ref(false);
const selectedCharacterNames = computed(() =>
	characterFilterOptions.value.filter(c => selectedCharacters.value.includes(c.id))
);

const teamFilterOptions = computed(() => {
	const teams = filtersAllowed.value?.teams ?? [];
	return [...teams].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedTeams = ref<number[]>([]);
const showTeamsDropdown = ref(false);
const selectedTeamNames = computed(() =>
	teamFilterOptions.value.filter(t => selectedTeams.value.includes(t.id))
);

const locationFilterOptions = computed(() => {
	const locations = filtersAllowed.value?.locations ?? [];
	return [...locations].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedLocations = ref<number[]>([]);
const showLocationsDropdown = ref(false);
const selectedLocationNames = computed(() =>
	locationFilterOptions.value.filter(l => selectedLocations.value.includes(l.id))
);

const sortCategory = ref("latest");
const route = useRoute();

const isLatestRoute = computed(() => route.path === '/comic-series/latest');

watch(
	() => route.path,
	(newPath) => {
		if (newPath === '/comic-series/latest') {
			sortCategory.value = 'latest';
		}
	},
	{ immediate: true },
);

const areThereActiveFilters = computed(() => {
	return Object.values(filtersApplied.value).some(filterArray => filterArray.length > 0);
});

onMounted(async () => {
	const comicSeriesStore = useComicSeriesStore();
	const data = await comicSeriesStore.fetchComicSeriesList(1, 20, "latest");
	comics.value = data || [];

	const filterValues = await comicSeriesStore.fetchComicSeriesFilterValues();
	filtersAllowed.value = filterValues || null;

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
					v-model="sortCategory"
					:disabled="isLatestRoute"
					class="px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
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
			<div class="grid grid-cols-4 gap-4">
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
						<div v-for="genre in genreFilterOptions" :key="genre.id">
							<input type="checkbox" :id="`genre-${genre.id}`" />
							<label :for="`genre-${genre.id}`">{{ genre.name }}</label>
						</div>
						<div v-if="genreFilterOptions.length === 0" class="text-xs text-text-secondary/70">
							No genres found
						</div>
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
						<div v-for="year in yearFilterOptions" :key="year">
							<input type="checkbox" :id="`year-${year}`" />
							<label :for="`year-${year}`">{{ year }}</label>
						</div>
						<div v-if="yearFilterOptions.length === 0" class="text-xs text-text-secondary/70">
							No years found
						</div>
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
					<!-- Dropdown trigger -->
					<div class="relative">
						<button
							type="button"
							@click="showCharactersDropdown = !showCharactersDropdown"
							class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
						>
							<span class="text-text-secondary/70">
								{{ selectedCharacters.length === 0 ? 'Select characters...' : `${selectedCharacters.length} selected` }}
							</span>
							<AppIcon :name="showTeamsDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
						</button>
						<!-- Dropdown list -->
						<div
							v-if="showCharactersDropdown"
							class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
						>
							<div v-if="characterFilterOptions.length === 0" class="px-3 py-2 text-xs text-text-secondary/70">
								No characters found
							</div>
							<label
								v-for="character in characterFilterOptions"
								:key="character.id"
								class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
							>
								<input
									type="checkbox"
									:value="character.id"
									v-model="selectedCharacters"
									class="accent-primary"
								/>
								{{ character.name }}
							</label>
						</div>
					</div>
					<!-- Selected chips -->
					<div v-if="selectedCharacterNames.length > 0" class="flex flex-wrap gap-1 mt-1">
						<span
							v-for="character in selectedCharacterNames"
							:key="character.id"
							class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-xs text-text-primary"
						>
							{{ character.name }}
							<button
								type="button"
								@click="selectedCharacters = selectedCharacters.filter(id => id !== character.id)"
								class="leading-none hover:text-red-400"
								aria-label="Remove"
							>×</button>
						</span>
					</div>

					<div class="text-sm text-text-secondary">
						Teams
					</div>
					<div class="relative">
						<button
							type="button"
							@click="showTeamsDropdown = !showTeamsDropdown"
							class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
						>
							<span class="text-text-secondary/70">
								{{ selectedTeams.length === 0 ? 'Select teams...' : `${selectedTeams.length} selected` }}
							</span>
							<AppIcon :name="showTeamsDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
						</button>
						<div
							v-if="showTeamsDropdown"
							class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
						>
							<div v-if="teamFilterOptions.length === 0" class="px-3 py-2 text-xs text-text-secondary/70">
								No teams found
							</div>
							<label
								v-for="team in teamFilterOptions"
								:key="team.id"
								class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
							>
								<input type="checkbox" :value="team.id" v-model="selectedTeams" class="accent-primary" />
								{{ team.name }}
							</label>
						</div>
					</div>
					<div v-if="selectedTeamNames.length > 0" class="flex flex-wrap gap-1 mt-1">
						<span
							v-for="team in selectedTeamNames"
							:key="team.id"
							class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-xs text-text-primary"
						>
							{{ team.name }}
							<button
								type="button"
								@click="selectedTeams = selectedTeams.filter(id => id !== team.id)"
								class="leading-none hover:text-red-400"
								aria-label="Remove"
							>×</button>
						</span>
					</div>

					<div class="text-sm text-text-secondary">
						Locations
					</div>
					<div class="relative">
						<button
							type="button"
							@click="showLocationsDropdown = !showLocationsDropdown"
							class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
						>
							<span class="text-text-secondary/70">
								{{ selectedLocations.length === 0 ? 'Select locations...' : `${selectedLocations.length} selected` }}
							</span>
							<AppIcon :name="showTeamsDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
						</button>
						<div
							v-if="showLocationsDropdown"
							class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
						>
							<div v-if="locationFilterOptions.length === 0" class="px-3 py-2 text-xs text-text-secondary/70">
								No locations found
							</div>
							<label
								v-for="location in locationFilterOptions"
								:key="location.id"
								class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
							>
								<input type="checkbox" :value="location.id" v-model="selectedLocations" class="accent-primary" />
								{{ location.name }}
							</label>
						</div>
					</div>
					<div v-if="selectedLocationNames.length > 0" class="flex flex-wrap gap-1 mt-1">
						<span
							v-for="location in selectedLocationNames"
							:key="location.id"
							class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-xs text-text-primary"
						>
							{{ location.name }}
							<button
								type="button"
								@click="selectedLocations = selectedLocations.filter(id => id !== location.id)"
								class="leading-none hover:text-red-400"
								aria-label="Remove"
							>×</button>
						</span>
					</div>
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