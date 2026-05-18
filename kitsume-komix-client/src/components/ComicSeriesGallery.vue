<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useComicSeriesStore } from '@/stores/comic-series';

import ComicSeriesCard from './ComicSeriesCard.vue';
import AppIcon from './icons/AppIcon.vue';
import FilterPill from './gallery/FilterPill.vue';

import type { ComicSeriesListItem } from '@/types';
import type { ComicSeriesFilterValuesData } from '@/types/comic-series.types';

const comics = ref<ComicSeriesListItem[]>([]);

const showFilters = ref(false);
const filtersAllowed = ref<ComicSeriesFilterValuesData | null>(null);

const yearFilterOptions = computed(() => filtersAllowed.value?.years ?? []);
const genreFilterOptions = computed(() => {
	const genres = filtersAllowed.value?.genres ?? [];
	return [...genres].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedGenres = ref<number[]>([]);
const showGenresDropdown = ref(false);
const selectedGenreNames = computed(() =>
	genreFilterOptions.value.filter(g => selectedGenres.value.includes(g.id))
);
const selectedYears = ref<number[]>([]);
const showYearsDropdown = ref(false);
const selectedYearValues = computed(() =>
	yearFilterOptions.value.filter(year => selectedYears.value.includes(year))
);
const letterFilterOptions = computed(() => {
	const letters = filtersAllowed.value?.letters ?? [];
	return [...letters].sort((a, b) => a.localeCompare(b));
});
const selectedLetters = ref<string[]>([]);
const showLettersDropdown = ref(false);
const selectedLetterValues = computed(() =>
	letterFilterOptions.value.filter(letter => selectedLetters.value.includes(letter))
);
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

const writerFilterOptions = computed(() => {
	const writers = filtersAllowed.value?.writers ?? [];
	return [...writers].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedWriters = ref<number[]>([]);
const showWritersDropdown = ref(false);
const selectedWriterNames = computed(() =>
	writerFilterOptions.value.filter(w => selectedWriters.value.includes(w.id))
);

const artistFilterOptions = computed(() => {
	const artists = filtersAllowed.value?.pencillers ?? [];
	return [...artists].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedArtists = ref<number[]>([]);
const showArtistsDropdown = ref(false);
const selectedArtistNames = computed(() =>
	artistFilterOptions.value.filter(a => selectedArtists.value.includes(a.id))
);

const publisherFilterOptions = computed(() => {
	const publishers = filtersAllowed.value?.publishers ?? [];
	return [...publishers].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedPublishers = ref<number[]>([]);
const showPublishersDropdown = ref(false);
const selectedPublisherNames = computed(() =>
	publisherFilterOptions.value.filter(p => selectedPublishers.value.includes(p.id))
);

const coloristFilterOptions = computed(() => {
	const colorists = filtersAllowed.value?.colorists ?? [];
	return [...colorists].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedColorists = ref<number[]>([]);
const showColoristsDropdown = ref(false);
const selectedColoristNames = computed(() =>
	coloristFilterOptions.value.filter(c => selectedColorists.value.includes(c.id))
);

const lettererFilterOptions = computed(() => {
	const letterers = filtersAllowed.value?.letterers ?? [];
	return [...letterers].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedLetterers = ref<number[]>([]);
const showLetterersDropdown = ref(false);
const selectedLettererNames = computed(() =>
	lettererFilterOptions.value.filter(l => selectedLetterers.value.includes(l.id))
);

const editorFilterOptions = computed(() => {
	const editors = filtersAllowed.value?.editors ?? [];
	return [...editors].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedEditors = ref<number[]>([]);
const showEditorsDropdown = ref(false);
const selectedEditorNames = computed(() =>
	editorFilterOptions.value.filter(e => selectedEditors.value.includes(e.id))
);

const coverArtistFilterOptions = computed(() => {
	const coverArtists = filtersAllowed.value?.coverArtists ?? [];
	return [...coverArtists].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedCoverArtists = ref<number[]>([]);
const showCoverArtistsDropdown = ref(false);
const selectedCoverArtistNames = computed(() =>
	coverArtistFilterOptions.value.filter(c => selectedCoverArtists.value.includes(c.id))
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
	return [
		selectedGenres.value,
		selectedYears.value,
		selectedLetters.value,
		selectedCharacters.value,
		selectedTeams.value,
		selectedLocations.value,
		selectedWriters.value,
		selectedArtists.value,
		selectedPublishers.value,
		selectedColorists.value,
		selectedLetterers.value,
		selectedEditors.value,
		selectedCoverArtists.value,
	].some(selectedValues => selectedValues.length > 0);
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
					:class="[
						'px-3 py-1.5 rounded-md text-text-primary text-sm font-medium border transition-colors',
						areThereActiveFilters
							? 'bg-primary/30 border-primary/60 hover:bg-primary/40'
							: 'bg-black/40 border-white/15 hover:bg-black/60'
					]"
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
			<div class="grid grid-cols-3 gap-4">
				<!-- Filter Column - Browse -->
				<div class="flex flex-col gap-2 bg-surface-overlay/80 p-3 rounded-lg">
					<label class="text-xs font-semibold text-text-primary uppercase">
						<AppIcon name="genreCheck" scale="0.8" class="mr-1" />
						Browse
					</label>

					<div class="text-sm text-text-secondary">
						Genres
					</div>
					<div class="relative">
						<button
							type="button"
							@click="showGenresDropdown = !showGenresDropdown"
							class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
						>
							<span class="text-text-secondary/70">
								{{ selectedGenres.length === 0 ? 'Select genres...' : `${selectedGenres.length} selected` }}
							</span>
							<AppIcon :name="showGenresDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
						</button>
						<div
							v-if="showGenresDropdown"
							class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
						>
							<div v-if="genreFilterOptions.length === 0" class="px-3 py-2 text-xs text-text-secondary/70">
								No genres found
							</div>
							<label
								v-for="genre in genreFilterOptions"
								:key="genre.id"
								class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
							>
								<input type="checkbox" :value="genre.id" v-model="selectedGenres" class="accent-primary" />
								{{ genre.name }}
							</label>
						</div>
					</div>
					<div v-if="selectedGenreNames.length > 0" class="flex flex-wrap gap-1 mt-1">
						<FilterPill
							v-for="genre in selectedGenreNames"
							:key="genre.id"
							:item="{id: genre.id, name: genre.name}"
							@remove="selectedGenres = selectedGenres.filter(id => id !== genre.id)"
						/>
					</div>

					<div class="text-sm text-text-secondary">
						Years
					</div>
					<div class="relative">
						<button
							type="button"
							@click="showYearsDropdown = !showYearsDropdown"
							class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
						>
							<span class="text-text-secondary/70">
								{{ selectedYears.length === 0 ? 'Select years...' : `${selectedYears.length} selected` }}
							</span>
							<AppIcon :name="showYearsDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
						</button>
						<div
							v-if="showYearsDropdown"
							class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
						>
							<div v-if="yearFilterOptions.length === 0" class="px-3 py-2 text-xs text-text-secondary/70">
								No years found
							</div>
							<label
								v-for="year in yearFilterOptions"
								:key="year"
								class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
							>
								<input type="checkbox" :value="year" v-model="selectedYears" class="accent-primary" />
								{{ year }}
							</label>
						</div>
					</div>
					<div v-if="selectedYearValues.length > 0" class="flex flex-wrap gap-1 mt-1">
						<FilterPill
							v-for="year in selectedYearValues"
							:key="year"
							:item="{id: year, name: year.toString()}"
							@remove="selectedYears = selectedYears.filter(selectedYear => selectedYear !== year)"
						/>
					</div>

					<div class="text-sm text-text-secondary">
						Letters
					</div>
					<div class="relative">
						<button
							type="button"
							@click="showLettersDropdown = !showLettersDropdown"
							class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
						>
							<span class="text-text-secondary/70">
								{{ selectedLetters.length === 0 ? 'Select letters...' : `${selectedLetters.length} selected` }}
							</span>
							<AppIcon :name="showLettersDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
						</button>
						<div
							v-if="showLettersDropdown"
							class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
						>
							<div v-if="letterFilterOptions.length === 0" class="px-3 py-2 text-xs text-text-secondary/70">
								No letters found
							</div>
							<label
								v-for="letter in letterFilterOptions"
								:key="letter"
								class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
							>
								<input type="checkbox" :value="letter" v-model="selectedLetters" class="accent-primary" />
								{{ letter.toUpperCase() }}
							</label>
						</div>
					</div>
					<div v-if="selectedLetterValues.length > 0" class="flex flex-wrap gap-1 mt-1">
						<FilterPill
							v-for="letter in selectedLetterValues"
							:key="letter"
							:item="{id: letter, name: letter.toUpperCase()}"
							@remove="selectedLetters = selectedLetters.filter(selectedLetter => selectedLetter !== letter)"
						/>
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
							<AppIcon :name="showCharactersDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
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
						<FilterPill
							v-for="character in selectedCharacterNames"
							:key="character.id"
							:item="{id: character.id, name: character.name}"
							@remove="selectedCharacters = selectedCharacters.filter(id => id !== character.id)"
						/>
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
						<FilterPill
							v-for="team in selectedTeamNames"
							:key="team.id"
							:item="{id: team.id, name: team.name}"
							@remove="selectedTeams = selectedTeams.filter(id => id !== team.id)"
						/>
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
							<AppIcon :name="showLocationsDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
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
						<FilterPill
							v-for="location in selectedLocationNames"
							:key="location.id"
							:item="{id: location.id, name: location.name}"
							@remove="selectedLocations = selectedLocations.filter(id => id !== location.id)"
						/>
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
						<div class="relative">
							<button
								type="button"
								@click="showWritersDropdown = !showWritersDropdown"
								class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
							>
								<span class="text-text-secondary/70">
									{{ selectedWriters.length === 0 ? 'Select writers...' : `${selectedWriters.length} selected` }}
								</span>
								<AppIcon :name="showWritersDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
							</button>
							<div
								v-if="showWritersDropdown"
								class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
							>
								<div v-if="writerFilterOptions.length === 0" class="px-3 py-2 text-xs text-text-secondary/70">
									No writers found
								</div>
								<label
									v-for="writer in writerFilterOptions"
									:key="writer.id"
									class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
								>
									<input type="checkbox" :value="writer.id" v-model="selectedWriters" class="accent-primary" />
									{{ writer.name }}
								</label>
							</div>
						</div>
						<div v-if="selectedWriterNames.length > 0" class="flex flex-wrap gap-1 mt-1">
							<FilterPill
								v-for="writer in selectedWriterNames"
								:key="writer.id"
								:item="{id: writer.id, name: writer.name}"
								@remove="selectedWriters = selectedWriters.filter(id => id !== writer.id)"
							/>
						</div>

						<div class="text-sm text-text-secondary">
							Illustrated by
						</div>
						<div class="relative">
							<button
								type="button"
								@click="showArtistsDropdown = !showArtistsDropdown"
								class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
							>
								<span class="text-text-secondary/70">
									{{ selectedArtists.length === 0 ? 'Select artists...' : `${selectedArtists.length} selected` }}
								</span>
								<AppIcon :name="showArtistsDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
							</button>
							<div
								v-if="showArtistsDropdown"
								class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
							>
								<div v-if="artistFilterOptions.length === 0" class="px-3 py-2 text-xs text-text-secondary/70">
									No artists found
								</div>
								<label
									v-for="artist in artistFilterOptions"
									:key="artist.id"
									class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
								>
									<input type="checkbox" :value="artist.id" v-model="selectedArtists" class="accent-primary" />
									{{ artist.name }}
								</label>
							</div>
						</div>
						<div v-if="selectedArtistNames.length > 0" class="flex flex-wrap gap-1 mt-1">
							<FilterPill
								v-for="artist in selectedArtistNames"
								:key="artist.id"
								:item="{id: artist.id, name: artist.name}"
								@remove="selectedArtists = selectedArtists.filter(id => id !== artist.id)"
							/>
						</div>

						<div class="text-sm text-text-secondary">
							Published by
						</div>
						<div class="relative">
							<button
								type="button"
								@click="showPublishersDropdown = !showPublishersDropdown"
								class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
							>
								<span class="text-text-secondary/70">
									{{ selectedPublishers.length === 0 ? 'Select publishers...' : `${selectedPublishers.length} selected` }}
								</span>
								<AppIcon :name="showPublishersDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
							</button>
							<div
								v-if="showPublishersDropdown"
								class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
							>
								<div v-if="publisherFilterOptions.length === 0" class="px-3 py-2 text-xs text-text-secondary/70">
									No publishers found
								</div>
								<label
									v-for="publisher in publisherFilterOptions"
									:key="publisher.id"
									class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
								>
									<input type="checkbox" :value="publisher.id" v-model="selectedPublishers" class="accent-primary" />
									{{ publisher.name }}
								</label>
							</div>
						</div>
						<div v-if="selectedPublisherNames.length > 0" class="flex flex-wrap gap-1 mt-1">
							<FilterPill
								v-for="publisher in selectedPublisherNames"
								:key="publisher.id"
								:item="{id: publisher.id, name: publisher.name}"
								@remove="selectedPublishers = selectedPublishers.filter(id => id !== publisher.id)"
							/>
						</div>

						<div class="text-sm text-text-secondary">
							Colored by
						</div>
						<div class="relative">
							<button
								type="button"
								@click="showColoristsDropdown = !showColoristsDropdown"
								class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
							>
								<span class="text-text-secondary/70">
									{{ selectedColorists.length === 0 ? 'Select colorists...' : `${selectedColorists.length} selected` }}
								</span>
								<AppIcon :name="showColoristsDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
							</button>
							<div
								v-if="showColoristsDropdown"
								class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
							>
								<div v-if="coloristFilterOptions.length === 0" class="px-3 py-2 text-xs text-text-secondary/70">
									No colorists found
								</div>
								<label
									v-for="colorist in coloristFilterOptions"
									:key="colorist.id"
									class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
								>
									<input type="checkbox" :value="colorist.id" v-model="selectedColorists" class="accent-primary" />
									{{ colorist.name }}
								</label>
							</div>
						</div>
						<div v-if="selectedColoristNames.length > 0" class="flex flex-wrap gap-1 mt-1">
							<FilterPill
								v-for="colorist in selectedColoristNames"
								:key="colorist.id"
								:item="{id: colorist.id, name: colorist.name}"
								@remove="selectedColorists = selectedColorists.filter(id => id !== colorist.id)"
							/>
						</div>

						<div class="text-sm text-text-secondary">
							Lettered by
						</div>
						<div class="relative">
							<button
								type="button"
								@click="showLetterersDropdown = !showLetterersDropdown"
								class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
							>
								<span class="text-text-secondary/70">
									{{ selectedLetterers.length === 0 ? 'Select letterers...' : `${selectedLetterers.length} selected` }}
								</span>
								<AppIcon :name="showLetterersDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
							</button>
							<div
								v-if="showLetterersDropdown"
								class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
							>
								<div v-if="lettererFilterOptions.length === 0" class="px-3 py-2 text-xs text-text-secondary/70">
									No letterers found
								</div>
								<label
									v-for="letterer in lettererFilterOptions"
									:key="letterer.id"
									class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
								>
									<input type="checkbox" :value="letterer.id" v-model="selectedLetterers" class="accent-primary" />
									{{ letterer.name }}
								</label>
							</div>
						</div>
						<div v-if="selectedLettererNames.length > 0" class="flex flex-wrap gap-1 mt-1">
							<FilterPill
								v-for="letterer in selectedLettererNames"
								:key="letterer.id"
								:item="{id: letterer.id, name: letterer.name}"
								@remove="selectedLetterers = selectedLetterers.filter(id => id !== letterer.id)"
							/>
						</div>

						<div class="text-sm text-text-secondary">
							Edited by
						</div>
						<div class="relative">
							<button
								type="button"
								@click="showEditorsDropdown = !showEditorsDropdown"
								class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
							>
								<span class="text-text-secondary/70">
									{{ selectedEditors.length === 0 ? 'Select editors...' : `${selectedEditors.length} selected` }}
								</span>
								<AppIcon :name="showEditorsDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
							</button>
							<div
								v-if="showEditorsDropdown"
								class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
							>
								<div v-if="editorFilterOptions.length === 0" class="px-3 py-2 text-xs text-text-secondary/70">
									No editors found
								</div>
								<label
									v-for="editor in editorFilterOptions"
									:key="editor.id"
									class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
								>
									<input type="checkbox" :value="editor.id" v-model="selectedEditors" class="accent-primary" />
									{{ editor.name }}
								</label>
							</div>
						</div>
						<div v-if="selectedEditorNames.length > 0" class="flex flex-wrap gap-1 mt-1">
							<FilterPill
								v-for="editor in selectedEditorNames"
								:key="editor.id"
								:item="{id: editor.id, name: editor.name}"
								@remove="selectedEditors = selectedEditors.filter(id => id !== editor.id)"
							/>
						</div>

						<div class="text-sm text-text-secondary">
							Cover by
						</div>
						<div class="relative">
							<button
								type="button"
								@click="showCoverArtistsDropdown = !showCoverArtistsDropdown"
								class="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
							>
								<span class="text-text-secondary/70">
									{{ selectedCoverArtists.length === 0 ? 'Select cover artists...' : `${selectedCoverArtists.length} selected` }}
								</span>
								<AppIcon :name="showCoverArtistsDropdown ? 'arrowUp' : 'arrowDown'" scale="0.7" />
							</button>
							<div
								v-if="showCoverArtistsDropdown"
								class="absolute z-10 mt-1 w-full rounded-md bg-surface-elevated border border-white/15 shadow-lg max-h-48 overflow-y-auto"
							>
								<div v-if="coverArtistFilterOptions.length === 0" class="px-3 py-2 text-xs text-text-secondary/70">
									No cover artists found
								</div>
								<label
									v-for="coverArtist in coverArtistFilterOptions"
									:key="coverArtist.id"
									class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm text-text-primary"
								>
									<input type="checkbox" :value="coverArtist.id" v-model="selectedCoverArtists" class="accent-primary" />
									{{ coverArtist.name }}
								</label>
							</div>
						</div>
						<div v-if="selectedCoverArtistNames.length > 0" class="flex flex-wrap gap-1 mt-1">
							<FilterPill
								v-for="coverArtist in selectedCoverArtistNames"
								:key="coverArtist.id"
								:item="{id: coverArtist.id, name: coverArtist.name}"
								@remove="selectedCoverArtists = selectedCoverArtists.filter(id => id !== coverArtist.id)"
							/>
						</div>

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