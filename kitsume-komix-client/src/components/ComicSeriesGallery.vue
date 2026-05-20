<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useComicSeriesStore } from '@/stores/comic-series';

import ComicSeriesCard from './ComicSeriesCard.vue';
import AppIcon from './icons/AppIcon.vue';
import FilterPill from './gallery/FilterPill.vue';
import FilterDropdown from './gallery/FilterDropdown.vue';
import FilterDropdownArea from './gallery/FilterDropdownArea.vue';
import FilterColumn from './gallery/FilterColumn.vue';

import type { ComicSeriesListItem } from '@/types';
import type { ComicSeriesFilterValuesData } from '@/types/comic-series.types';

const comics = ref<ComicSeriesListItem[]>([]);
const comicSeriesStore = useComicSeriesStore();

const showFilters = ref(false);
const filtersAllowed = ref<ComicSeriesFilterValuesData | null>(null);

const yearFilterOptions = computed(() => filtersAllowed.value?.years ?? []);
const genreFilterOptions = computed(() => {
	const genres = filtersAllowed.value?.genres ?? [];
	return [...genres].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedGenres = ref<number[]>([]);
const selectedGenreNames = computed(() =>
	genreFilterOptions.value.filter(g => selectedGenres.value.includes(g.id))
);
const selectedYears = ref<number[]>([]);
const selectedYearValues = computed(() =>
	yearFilterOptions.value.filter(year => selectedYears.value.includes(year))
);
const letterFilterOptions = computed(() => {
	const letters = filtersAllowed.value?.letters ?? [];
	return [...letters].sort((a, b) => a.localeCompare(b));
});
const selectedLetters = ref<string[]>([]);
const selectedLetterValues = computed(() =>
	letterFilterOptions.value.filter(letter => selectedLetters.value.includes(letter))
);
const characterFilterOptions = computed(() => {
	const characters = filtersAllowed.value?.characters ?? [];
	return [...characters].sort((a, b) => a.name.localeCompare(b.name));
});

const selectedCharacters = ref<number[]>([]);
const selectedCharacterNames = computed(() =>
	characterFilterOptions.value.filter(c => selectedCharacters.value.includes(c.id))
);

const teamFilterOptions = computed(() => {
	const teams = filtersAllowed.value?.teams ?? [];
	return [...teams].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedTeams = ref<number[]>([]);
const selectedTeamNames = computed(() =>
	teamFilterOptions.value.filter(t => selectedTeams.value.includes(t.id))
);

const locationFilterOptions = computed(() => {
	const locations = filtersAllowed.value?.locations ?? [];
	return [...locations].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedLocations = ref<number[]>([]);
const selectedLocationNames = computed(() =>
	locationFilterOptions.value.filter(l => selectedLocations.value.includes(l.id))
);

const writerFilterOptions = computed(() => {
	const writers = filtersAllowed.value?.writers ?? [];
	return [...writers].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedWriters = ref<number[]>([]);
const selectedWriterNames = computed(() =>
	writerFilterOptions.value.filter(w => selectedWriters.value.includes(w.id))
);

const artistFilterOptions = computed(() => {
	const artists = filtersAllowed.value?.pencillers ?? [];
	return [...artists].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedArtists = ref<number[]>([]);
const selectedArtistNames = computed(() =>
	artistFilterOptions.value.filter(a => selectedArtists.value.includes(a.id))
);

const publisherFilterOptions = computed(() => {
	const publishers = filtersAllowed.value?.publishers ?? [];
	return [...publishers].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedPublishers = ref<number[]>([]);
const selectedPublisherNames = computed(() =>
	publisherFilterOptions.value.filter(p => selectedPublishers.value.includes(p.id))
);

const coloristFilterOptions = computed(() => {
	const colorists = filtersAllowed.value?.colorists ?? [];
	return [...colorists].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedColorists = ref<number[]>([]);
const selectedColoristNames = computed(() =>
	coloristFilterOptions.value.filter(c => selectedColorists.value.includes(c.id))
);

const lettererFilterOptions = computed(() => {
	const letterers = filtersAllowed.value?.letterers ?? [];
	return [...letterers].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedLetterers = ref<number[]>([]);
const selectedLettererNames = computed(() =>
	lettererFilterOptions.value.filter(l => selectedLetterers.value.includes(l.id))
);

const editorFilterOptions = computed(() => {
	const editors = filtersAllowed.value?.editors ?? [];
	return [...editors].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedEditors = ref<number[]>([]);
const selectedEditorNames = computed(() =>
	editorFilterOptions.value.filter(e => selectedEditors.value.includes(e.id))
);

const coverArtistFilterOptions = computed(() => {
	const coverArtists = filtersAllowed.value?.coverArtists ?? [];
	return [...coverArtists].sort((a, b) => a.name.localeCompare(b.name));
});
const selectedCoverArtists = ref<number[]>([]);
const selectedCoverArtistNames = computed(() =>
	coverArtistFilterOptions.value.filter(c => selectedCoverArtists.value.includes(c.id))
);

const sortCategory = ref("");
const pageSize = ref(20);
const PAGE_SIZE_OPTIONS = [10, 20, 25, 30, 40, 50, 100];
const route = useRoute();

const isLatestRoute = computed(() => route.path === '/comic-series/latest');

watch(
	() => route.path,
	(newPath) => {
		if (newPath === '/comic-series/latest') {
			sortCategory.value = 'createdAt';
		} else if (newPath === '/comic-series/updated') {
			sortCategory.value = 'updatedAt';
		} else if (newPath === '/comic-series/list') {
			sortCategory.value = 'name';
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

const activeFilters = computed(() => ({
	genres: selectedGenres.value,
	years: selectedYears.value,
	letters: selectedLetters.value,
	characters: selectedCharacters.value,
	teams: selectedTeams.value,
	locations: selectedLocations.value,
	writers: selectedWriters.value,
	artists: selectedArtists.value,
	publishers: selectedPublishers.value,
	colorists: selectedColorists.value,
	letterers: selectedLetterers.value,
	editors: selectedEditors.value,
	coverArtists: selectedCoverArtists.value,
}));

const FILTER_PROPERTY_MAP: Record<keyof typeof activeFilters.value, string> = {
	genres: 'genreId',
	years: 'year',
	letters: 'letter',
	characters: 'characterId',
	teams: 'teamId',
	locations: 'locationId',
	writers: 'writerId',
	artists: 'pencillerId',
	publishers: 'publisherId',
	colorists: 'coloristId',
	letterers: 'lettererId',
	editors: 'editorId',
	coverArtists: 'coverArtistId',
};

const currentPage = ref(1);
const totalCount = ref(0);
const hasNextPage = ref(false);

const totalPages = computed(() =>
	totalCount.value > 0 ? Math.ceil(totalCount.value / pageSize.value) : 0,
);

const visiblePages = computed((): (number | 'ellipsis')[] => {
	const total = totalPages.value;
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
	const result: (number | 'ellipsis')[] = [];
	for (let i = 0; i < sorted.length; i++) {
		result.push(sorted[i]);
		if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
			result.push('ellipsis');
		}
	}
	return result;
});

const fetchPage = async (page: number) => {
	const filterProperties: string[] = [];
	const filterValues: string[] = [];

	for (const [key, ids] of Object.entries(activeFilters.value)) {
		const prop = FILTER_PROPERTY_MAP[key as keyof typeof activeFilters.value];
		for (const id of ids) {
			filterProperties.push(prop);
			filterValues.push(String(id));
		}
	}

	const result = await comicSeriesStore.fetchComicSeriesList(
		page,
		pageSize.value,
		sortCategory.value,
		filterProperties,
		filterValues,
	);
	comics.value = result.data;
	totalCount.value = result.meta.count;
	hasNextPage.value = result.meta.hasNextPage;
	currentPage.value = page;
};

const goToPage = (page: number) => {
	if (page < 1 || page > totalPages.value) return;
	fetchPage(page);
};

watch(activeFilters, () => {
	fetchPage(1);
}, { deep: true });

watch(sortCategory, () => {
	fetchPage(1);
});

watch(pageSize, () => {
	fetchPage(1);
});

onMounted(async () => {
	const result = await comicSeriesStore.fetchComicSeriesList(1, pageSize.value, "latest");
	comics.value = result.data || [];
	totalCount.value = result.meta.count;
	hasNextPage.value = result.meta.hasNextPage;

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
					<option value="createdAt">Latest</option>
					<option value="updatedAt">Recently Updated</option>
					<option value="name">Name</option>
					<option value="publicationDate">Publication Date</option>
				</select>
				<label for="page-size" class="text-sm text-text-secondary">Per page</label>
				<select
					id="page-size"
					v-model.number="pageSize"
					class="px-3 py-1.5 rounded-md bg-black/30 border border-white/15 text-text-primary text-sm focus:outline-none"
				>
					<option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">{{ size }}</option>
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
				<span class="ml-2 text-sm text-text-secondary">{{ totalCount }} series</span>
			</div>
			
		</div>

		<!-- Filters panel -->
		<div v-if="showFilters" class="w-lwh mx-5 bg-surface-elevated border border-t-0 border-white/10 rounded-b-xl p-4">
			<div class="grid grid-cols-3 gap-4">
				<!-- Filter Column - Browse -->
				<FilterColumn label="Browse" icon-name="genreCheck">
					<FilterDropdownArea
						filterName="genres"
						byLine="Genres"
						selectLine="Select genres..."
						:emptyOptions="genreFilterOptions.length === 0"
						:selectedCount="selectedGenres.length"
					>
						<template #options>
							<FilterDropdown
								v-for="genre in genreFilterOptions"
								:key="genre.id"
								:property="{id: genre.id, name: genre.name}"
								:isSelected="selectedGenres.includes(genre.id)"
								@toggle="selectedGenres.push(genre.id)"
								@untoggle="selectedGenres = selectedGenres.filter(id => id !== genre.id)"
							/>
						</template>
						<template #pills>
							<FilterPill
								v-for="genre in selectedGenreNames"
								:key="genre.id"
								:item="{id: genre.id, name: genre.name}"
								@remove="selectedGenres = selectedGenres.filter(id => id !== genre.id)"
							/>
						</template>
					</FilterDropdownArea>

					<FilterDropdownArea
						filterName="years"
						byLine="Years"
						selectLine="Select years..."
						:emptyOptions="yearFilterOptions.length === 0"
						:selectedCount="selectedYears.length"
					>
						<template #options>
							<FilterDropdown
								v-for="year in yearFilterOptions"
								:key="year"
								:property="{id: year, name: year.toString()}"
								:isSelected="selectedYears.includes(year)"
								@toggle="selectedYears.push(year)"
								@untoggle="selectedYears = selectedYears.filter(y => y !== year)"
							/>
						</template>
						<template #pills>
							<FilterPill
								v-for="year in selectedYearValues"
								:key="year"
								:item="{id: year, name: year.toString()}"
								@remove="selectedYears = selectedYears.filter(y => y !== year)"
							/>
						</template>
					</FilterDropdownArea>

					<FilterDropdownArea
						filterName="letters"
						byLine="Letters"
						selectLine="Select letters..."
						:emptyOptions="letterFilterOptions.length === 0"
						:selectedCount="selectedLetters.length"
					>
						<template #options>
							<FilterDropdown
								v-for="letter in letterFilterOptions"
								:key="letter"
								:property="{id: letter, name: letter.toUpperCase()}"
								:isSelected="selectedLetters.includes(letter)"
								@toggle="selectedLetters.push(letter)"
								@untoggle="selectedLetters = selectedLetters.filter(l => l !== letter)"
							/>
						</template>
						<template #pills>
							<FilterPill
								v-for="letter in selectedLetterValues"
								:key="letter"
								:item="{id: letter, name: letter.toUpperCase()}"
								@remove="selectedLetters = selectedLetters.filter(l => l !== letter)"
							/>
						</template>
					</FilterDropdownArea>
				</FilterColumn>

				<!-- Filter Column - Content -->
				<FilterColumn label="Contents" icon-name="bookContent">
					<FilterDropdownArea
						filterName="characters"
						byLine="Characters"
						selectLine="Select characters..."
						:emptyOptions="characterFilterOptions.length === 0"
						:selectedCount="selectedCharacters.length"
					>
						<template #options>
							<FilterDropdown
								v-for="character in characterFilterOptions"
								:key="character.id"
								:property="{id: character.id, name: character.name}"
								:isSelected="selectedCharacters.includes(character.id)"
								@toggle="selectedCharacters.push(character.id)"
								@untoggle="selectedCharacters = selectedCharacters.filter(id => id !== character.id)"
							/>
						</template>
						<template #pills>
							<FilterPill
								v-for="character in selectedCharacterNames"
								:key="character.id"
								:item="{id: character.id, name: character.name}"
								@remove="selectedCharacters = selectedCharacters.filter(id => id !== character.id)"
							/>
						</template>
					</FilterDropdownArea>

					<FilterDropdownArea
						filterName="teams"
						byLine="Teams"
						selectLine="Select teams..."
						:emptyOptions="teamFilterOptions.length === 0"
						:selectedCount="selectedTeams.length"
					>
						<template #options>
							<FilterDropdown
								v-for="team in teamFilterOptions"
								:key="team.id"
								:property="{id: team.id, name: team.name}"
								:isSelected="selectedTeams.includes(team.id)"
								@toggle="selectedTeams.push(team.id)"
								@untoggle="selectedTeams = selectedTeams.filter(id => id !== team.id)"
							/>
						</template>
						<template #pills>
							<FilterPill
								v-for="team in selectedTeamNames"
								:key="team.id"
								:item="{id: team.id, name: team.name}"
								@remove="selectedTeams = selectedTeams.filter(id => id !== team.id)"
							/>
						</template>
					</FilterDropdownArea>

					<FilterDropdownArea
						filterName="locations"
						byLine="Locations"
						selectLine="Select locations..."
						:emptyOptions="locationFilterOptions.length === 0"
						:selectedCount="selectedLocations.length"
					>
						<template #options>
							<FilterDropdown
								v-for="location in locationFilterOptions"
								:key="location.id"
								:property="{id: location.id, name: location.name}"
								:isSelected="selectedLocations.includes(location.id)"
								@toggle="selectedLocations.push(location.id)"
								@untoggle="selectedLocations = selectedLocations.filter(id => id !== location.id)"
							/>
						</template>
						<template #pills>
							<FilterPill
								v-for="location in selectedLocationNames"
								:key="location.id"
								:item="{id: location.id, name: location.name}"
								@remove="selectedLocations = selectedLocations.filter(id => id !== location.id)"
							/>
						</template>
					</FilterDropdownArea>
				</FilterColumn>

				<!-- Filter Column Creators -->
				<FilterColumn label="Creators" icon-name="edit">
					<FilterDropdownArea
						filterName="writers"
						byLine="Written by"
						selectLine="Select writers..."
						:emptyOptions="writerFilterOptions.length === 0"
						:selectedCount="selectedWriters.length"
					>
						<template #options>
							<FilterDropdown
								v-for="writer in writerFilterOptions"
								:key="writer.id"
								:property="{id: writer.id, name: writer.name}"
								:isSelected="selectedWriters.includes(writer.id)"
								@toggle="selectedWriters.push(writer.id)"
								@untoggle="selectedWriters = selectedWriters.filter(id => id !== writer.id)"
							/>
						</template>
						<template #pills>
							<FilterPill
								v-for="writer in selectedWriterNames"
								:key="writer.id"
								:item="{id: writer.id, name: writer.name}"
								@remove="selectedWriters = selectedWriters.filter(id => id !== writer.id)"
							/>
						</template>
					</FilterDropdownArea>

					<FilterDropdownArea
						filterName="artists"
						byLine="Illustrated by"
						selectLine="Select artists..."
						:emptyOptions="artistFilterOptions.length === 0"
						:selectedCount="selectedArtists.length"
					>
						<template #options>
							<FilterDropdown
								v-for="artist in artistFilterOptions"
								:key="artist.id"
								:property="{id: artist.id, name: artist.name}"
								:isSelected="selectedArtists.includes(artist.id)"
								@toggle="selectedArtists.push(artist.id)"
								@untoggle="selectedArtists = selectedArtists.filter(id => id !== artist.id)"
							/>
						</template>
						<template #pills>
							<FilterPill
								v-for="artist in selectedArtistNames"
								:key="artist.id"
								:item="{id: artist.id, name: artist.name}"
								@remove="selectedArtists = selectedArtists.filter(id => id !== artist.id)"
							/>
						</template>
					</FilterDropdownArea>

					<FilterDropdownArea
						filterName="publishers"
						byLine="Published by"
						selectLine="Select publishers..."
						:emptyOptions="publisherFilterOptions.length === 0"
						:selectedCount="selectedPublishers.length"
					>
						<template #options>
							<FilterDropdown
								v-for="publisher in publisherFilterOptions"
								:key="publisher.id"
								:property="{id: publisher.id, name: publisher.name}"
								:isSelected="selectedPublishers.includes(publisher.id)"
								@toggle="selectedPublishers.push(publisher.id)"
								@untoggle="selectedPublishers = selectedPublishers.filter(id => id !== publisher.id)"
							/>
						</template>
						<template #pills>
							<FilterPill
								v-for="publisher in selectedPublisherNames"
								:key="publisher.id"
								:item="{id: publisher.id, name: publisher.name}"
								@remove="selectedPublishers = selectedPublishers.filter(id => id !== publisher.id)"
							/>
						</template>
					</FilterDropdownArea>

					<FilterDropdownArea
						filterName="colorists"
						byLine="Colored by"
						selectLine="Select colorists..."
						:emptyOptions="coloristFilterOptions.length === 0"
						:selectedCount="selectedColorists.length"
					>
						<template #options>
							<FilterDropdown
								v-for="colorist in coloristFilterOptions"
								:key="colorist.id"
								:property="{id: colorist.id, name: colorist.name}"
								:isSelected="selectedColorists.includes(colorist.id)"
								@toggle="selectedColorists.push(colorist.id)"
								@untoggle="selectedColorists = selectedColorists.filter(id => id !== colorist.id)"
							/>
						</template>
						<template #pills>
							<FilterPill
								v-for="colorist in selectedColoristNames"
								:key="colorist.id"
								:item="{id: colorist.id, name: colorist.name}"
								@remove="selectedColorists = selectedColorists.filter(id => id !== colorist.id)"
							/>
						</template>
					</FilterDropdownArea>

					<FilterDropdownArea
						filterName="letterers"
						byLine="Lettered by"
						selectLine="Select letterers..."
						:emptyOptions="lettererFilterOptions.length === 0"
						:selectedCount="selectedLetterers.length"
					>
						<template #options>
							<FilterDropdown
								v-for="letterer in lettererFilterOptions"
								:key="letterer.id"
								:property="{id: letterer.id, name: letterer.name}"
								:isSelected="selectedLetterers.includes(letterer.id)"
								@toggle="selectedLetterers.push(letterer.id)"
								@untoggle="selectedLetterers = selectedLetterers.filter(id => id !== letterer.id)"
							/>
						</template>
						<template #pills>
							<FilterPill
								v-for="letterer in selectedLettererNames"
								:key="letterer.id"
								:item="{id: letterer.id, name: letterer.name}"
								@remove="selectedLetterers = selectedLetterers.filter(id => id !== letterer.id)"
							/>
						</template>
					</FilterDropdownArea>

					<FilterDropdownArea
						filterName="editors"
						byLine="Edited by"
						selectLine="Select editors..."
						:emptyOptions="editorFilterOptions.length === 0"
						:selectedCount="selectedEditors.length"
					>
						<template #options>
							<FilterDropdown
								v-for="editor in editorFilterOptions"
								:key="editor.id"
								:property="{id: editor.id, name: editor.name}"
								:isSelected="selectedEditors.includes(editor.id)"
								@toggle="selectedEditors.push(editor.id)"
								@untoggle="selectedEditors = selectedEditors.filter(id => id !== editor.id)"
							/>
						</template>
						<template #pills>
							<FilterPill
								v-for="editor in selectedEditorNames"
								:key="editor.id"
								:item="{id: editor.id, name: editor.name}"
								@remove="selectedEditors = selectedEditors.filter(id => id !== editor.id)"
							/>
						</template>
					</FilterDropdownArea>

					<FilterDropdownArea
						filterName="cover artists"
						byLine="Cover by"
						selectLine="Select cover artists..."
						:emptyOptions="coverArtistFilterOptions.length === 0"
						:selectedCount="selectedCoverArtists.length"
					>
						<template #options>
							<FilterDropdown
								v-for="coverArtist in coverArtistFilterOptions"
								:key="coverArtist.id"
								:property="{id: coverArtist.id, name: coverArtist.name}"
								:isSelected="selectedCoverArtists.includes(coverArtist.id)"
								@toggle="selectedCoverArtists.push(coverArtist.id)"
								@untoggle="selectedCoverArtists = selectedCoverArtists.filter(id => id !== coverArtist.id)"
							/>
						</template>
						<template #pills>
							<FilterPill
								v-for="coverArtist in selectedCoverArtistNames"
								:key="coverArtist.id"
								:item="{id: coverArtist.id, name: coverArtist.name}"
								@remove="selectedCoverArtists = selectedCoverArtists.filter(id => id !== coverArtist.id)"
							/>
						</template>
					</FilterDropdownArea>
				</FilterColumn>
			</div>
		</div>

		<!-- Main content area -->
		<div class="flex-1 p-4 mx-8">
			<div class="grid grid-cols-5 gap-6">
				<ComicSeriesCard v-for="comic in comics" :key="comic.id" :comicSeriesData="comic" />
			</div>
		</div>

		<!-- Pagination -->
		<div v-if="totalPages > 1" class="flex items-center justify-between px-8 py-4 mx-5 mb-5">
			<span class="text-sm text-text-secondary">
				Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} series
			</span>
			<div class="flex items-center gap-1">
				<button
					type="button"
					@click="goToPage(currentPage - 1)"
					:disabled="currentPage === 1"
					class="px-3 py-1.5 rounded-md text-sm border border-white/15 bg-black/30 text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/50 transition-colors"
				>
					Prev
				</button>
				<template v-for="(item, idx) in visiblePages" :key="idx">
					<span v-if="item === 'ellipsis'" class="px-2 text-text-secondary select-none">…</span>
					<button
						v-else
						type="button"
						@click="goToPage(item)"
						:class="[
							'w-9 h-9 rounded-md text-sm border transition-colors',
							item === currentPage
								? 'bg-primary/30 border-primary/60 text-text-primary font-medium'
								: 'bg-black/30 border-white/15 text-text-primary hover:bg-black/50'
						]"
					>
						{{ item }}
					</button>
				</template>
				<button
					type="button"
					@click="goToPage(currentPage + 1)"
					:disabled="!hasNextPage"
					class="px-3 py-1.5 rounded-md text-sm border border-white/15 bg-black/30 text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/50 transition-colors"
				>
					Next
				</button>
			</div>
		</div>
	</div>
</template>