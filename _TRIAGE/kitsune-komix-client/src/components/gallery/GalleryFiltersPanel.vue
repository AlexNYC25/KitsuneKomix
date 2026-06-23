<script setup lang="ts">
import { toRef, watch } from 'vue';

import { useGalleryFilters } from '@/composables/useGalleryFilters';
import type { ComicSeriesFilterValuesData, ComicBooksFilterValuesData } from '@/types';

import FilterPill from './FilterPill.vue';
import FilterDropdown from './FilterDropdown.vue';
import FilterDropdownArea from './FilterDropdownArea.vue';
import FilterColumn from './FilterColumn.vue';

const props = defineProps<{
  filtersAllowed: ComicSeriesFilterValuesData | ComicBooksFilterValuesData | null;
  showFilters: boolean;
}>();

const emit = defineEmits<{
  'update:filterParams': [{ filterProperties: string[]; filterValues: string[] }];
  'update:hasActiveFilters': [value: boolean];
}>();

const {
  activeFilters,
  areThereActiveFilters,
  artistFilterOptions,
  buildFilterParams,
  characterFilterOptions,
  coloristFilterOptions,
  coverArtistFilterOptions,
  editorFilterOptions,
  genreFilterOptions,
  lettererFilterOptions,
  letterFilterOptions,
  locationFilterOptions,
  publisherFilterOptions,
  selectedArtists,
  selectedArtistNames,
  selectedCharacters,
  selectedCharacterNames,
  selectedColorists,
  selectedColoristNames,
  selectedCoverArtists,
  selectedCoverArtistNames,
  selectedEditors,
  selectedEditorNames,
  selectedGenres,
  selectedGenreNames,
  selectedLetters,
  selectedLetterers,
  selectedLettererNames,
  selectedLetterValues,
  selectedLocations,
  selectedLocationNames,
  selectedPublishers,
  selectedPublisherNames,
  selectedTeams,
  selectedTeamNames,
  selectedWriters,
  selectedWriterNames,
  selectedYears,
  selectedYearValues,
  teamFilterOptions,
  writerFilterOptions,
  yearFilterOptions,
} = useGalleryFilters(toRef(props, 'filtersAllowed'));

watch(
  activeFilters,
  () => {
    emit('update:filterParams', buildFilterParams());
  },
  { deep: true, immediate: true },
);

watch(
  areThereActiveFilters,
  (value) => {
    emit('update:hasActiveFilters', value);
  },
  { immediate: true },
);
</script>

<template>
  <div
    v-show="showFilters"
    class="w-lwh mx-5 bg-surface-elevated border border-t-0 border-white/10 rounded-b-xl p-4"
  >
    <div class="grid grid-cols-3 gap-4">
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
              :property="{ id: genre.id, name: genre.name }"
              :isSelected="selectedGenres.includes(genre.id)"
              @toggle="selectedGenres.push(genre.id)"
              @untoggle="selectedGenres = selectedGenres.filter(id => id !== genre.id)"
            />
          </template>
          <template #pills>
            <FilterPill
              v-for="genre in selectedGenreNames"
              :key="genre.id"
              :item="{ id: genre.id, name: genre.name }"
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
              :property="{ id: year, name: year.toString() }"
              :isSelected="selectedYears.includes(year)"
              @toggle="selectedYears.push(year)"
              @untoggle="selectedYears = selectedYears.filter(y => y !== year)"
            />
          </template>
          <template #pills>
            <FilterPill
              v-for="year in selectedYearValues"
              :key="year"
              :item="{ id: year, name: year.toString() }"
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
              :property="{ id: letter, name: letter.toUpperCase() }"
              :isSelected="selectedLetters.includes(letter)"
              @toggle="selectedLetters.push(letter)"
              @untoggle="selectedLetters = selectedLetters.filter(l => l !== letter)"
            />
          </template>
          <template #pills>
            <FilterPill
              v-for="letter in selectedLetterValues"
              :key="letter"
              :item="{ id: letter, name: letter.toUpperCase() }"
              @remove="selectedLetters = selectedLetters.filter(l => l !== letter)"
            />
          </template>
        </FilterDropdownArea>
      </FilterColumn>

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
              :property="{ id: character.id, name: character.name }"
              :isSelected="selectedCharacters.includes(character.id)"
              @toggle="selectedCharacters.push(character.id)"
              @untoggle="selectedCharacters = selectedCharacters.filter(id => id !== character.id)"
            />
          </template>
          <template #pills>
            <FilterPill
              v-for="character in selectedCharacterNames"
              :key="character.id"
              :item="{ id: character.id, name: character.name }"
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
              :property="{ id: team.id, name: team.name }"
              :isSelected="selectedTeams.includes(team.id)"
              @toggle="selectedTeams.push(team.id)"
              @untoggle="selectedTeams = selectedTeams.filter(id => id !== team.id)"
            />
          </template>
          <template #pills>
            <FilterPill
              v-for="team in selectedTeamNames"
              :key="team.id"
              :item="{ id: team.id, name: team.name }"
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
              :property="{ id: location.id, name: location.name }"
              :isSelected="selectedLocations.includes(location.id)"
              @toggle="selectedLocations.push(location.id)"
              @untoggle="selectedLocations = selectedLocations.filter(id => id !== location.id)"
            />
          </template>
          <template #pills>
            <FilterPill
              v-for="location in selectedLocationNames"
              :key="location.id"
              :item="{ id: location.id, name: location.name }"
              @remove="selectedLocations = selectedLocations.filter(id => id !== location.id)"
            />
          </template>
        </FilterDropdownArea>
      </FilterColumn>

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
              :property="{ id: writer.id, name: writer.name }"
              :isSelected="selectedWriters.includes(writer.id)"
              @toggle="selectedWriters.push(writer.id)"
              @untoggle="selectedWriters = selectedWriters.filter(id => id !== writer.id)"
            />
          </template>
          <template #pills>
            <FilterPill
              v-for="writer in selectedWriterNames"
              :key="writer.id"
              :item="{ id: writer.id, name: writer.name }"
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
              :property="{ id: artist.id, name: artist.name }"
              :isSelected="selectedArtists.includes(artist.id)"
              @toggle="selectedArtists.push(artist.id)"
              @untoggle="selectedArtists = selectedArtists.filter(id => id !== artist.id)"
            />
          </template>
          <template #pills>
            <FilterPill
              v-for="artist in selectedArtistNames"
              :key="artist.id"
              :item="{ id: artist.id, name: artist.name }"
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
              :property="{ id: publisher.id, name: publisher.name }"
              :isSelected="selectedPublishers.includes(publisher.id)"
              @toggle="selectedPublishers.push(publisher.id)"
              @untoggle="selectedPublishers = selectedPublishers.filter(id => id !== publisher.id)"
            />
          </template>
          <template #pills>
            <FilterPill
              v-for="publisher in selectedPublisherNames"
              :key="publisher.id"
              :item="{ id: publisher.id, name: publisher.name }"
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
              :property="{ id: colorist.id, name: colorist.name }"
              :isSelected="selectedColorists.includes(colorist.id)"
              @toggle="selectedColorists.push(colorist.id)"
              @untoggle="selectedColorists = selectedColorists.filter(id => id !== colorist.id)"
            />
          </template>
          <template #pills>
            <FilterPill
              v-for="colorist in selectedColoristNames"
              :key="colorist.id"
              :item="{ id: colorist.id, name: colorist.name }"
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
              :property="{ id: letterer.id, name: letterer.name }"
              :isSelected="selectedLetterers.includes(letterer.id)"
              @toggle="selectedLetterers.push(letterer.id)"
              @untoggle="selectedLetterers = selectedLetterers.filter(id => id !== letterer.id)"
            />
          </template>
          <template #pills>
            <FilterPill
              v-for="letterer in selectedLettererNames"
              :key="letterer.id"
              :item="{ id: letterer.id, name: letterer.name }"
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
              :property="{ id: editor.id, name: editor.name }"
              :isSelected="selectedEditors.includes(editor.id)"
              @toggle="selectedEditors.push(editor.id)"
              @untoggle="selectedEditors = selectedEditors.filter(id => id !== editor.id)"
            />
          </template>
          <template #pills>
            <FilterPill
              v-for="editor in selectedEditorNames"
              :key="editor.id"
              :item="{ id: editor.id, name: editor.name }"
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
              :property="{ id: coverArtist.id, name: coverArtist.name }"
              :isSelected="selectedCoverArtists.includes(coverArtist.id)"
              @toggle="selectedCoverArtists.push(coverArtist.id)"
              @untoggle="selectedCoverArtists = selectedCoverArtists.filter(id => id !== coverArtist.id)"
            />
          </template>
          <template #pills>
            <FilterPill
              v-for="coverArtist in selectedCoverArtistNames"
              :key="coverArtist.id"
              :item="{ id: coverArtist.id, name: coverArtist.name }"
              @remove="selectedCoverArtists = selectedCoverArtists.filter(id => id !== coverArtist.id)"
            />
          </template>
        </FilterDropdownArea>
      </FilterColumn>
    </div>
  </div>
</template>
