import { computed, type Ref, ref } from 'vue';

import { FILTER_PROPERTY_MAP } from '@/config/gallery';
import type { ComicSeriesFilterValuesData, GalleryActiveFilters, ComicBooksFilterValuesData } from '@/types';

export function useGalleryFilters(filtersAllowed: Ref<ComicSeriesFilterValuesData | ComicBooksFilterValuesData | null>) {
  const selectedGenres = ref<number[]>([]);
  const selectedYears = ref<number[]>([]);
  const selectedLetters = ref<string[]>([]);
  const selectedCharacters = ref<number[]>([]);
  const selectedTeams = ref<number[]>([]);
  const selectedLocations = ref<number[]>([]);
  const selectedWriters = ref<number[]>([]);
  const selectedArtists = ref<number[]>([]);
  const selectedPublishers = ref<number[]>([]);
  const selectedColorists = ref<number[]>([]);
  const selectedLetterers = ref<number[]>([]);
  const selectedEditors = ref<number[]>([]);
  const selectedCoverArtists = ref<number[]>([]);

  const yearFilterOptions = computed(() => filtersAllowed.value?.years ?? []);
  const genreFilterOptions = computed(() => {
    const genres = filtersAllowed.value?.genres ?? [];
    return [...genres].sort((a, b) => a.name.localeCompare(b.name));
  });
  const letterFilterOptions = computed(() => {
    const letters = filtersAllowed.value?.letters ?? [];
    return [...letters].sort((a, b) => a.localeCompare(b));
  });
  const characterFilterOptions = computed(() => {
    const characters = filtersAllowed.value?.characters ?? [];
    return [...characters].sort((a, b) => a.name.localeCompare(b.name));
  });
  const teamFilterOptions = computed(() => {
    const teams = filtersAllowed.value?.teams ?? [];
    return [...teams].sort((a, b) => a.name.localeCompare(b.name));
  });
  const locationFilterOptions = computed(() => {
    const locations = filtersAllowed.value?.locations ?? [];
    return [...locations].sort((a, b) => a.name.localeCompare(b.name));
  });
  const writerFilterOptions = computed(() => {
    const writers = filtersAllowed.value?.writers ?? [];
    return [...writers].sort((a, b) => a.name.localeCompare(b.name));
  });
  const artistFilterOptions = computed(() => {
    const artists = filtersAllowed.value?.pencilers ?? [];
    return [...artists].sort((a, b) => a.name.localeCompare(b.name));
  });
  const publisherFilterOptions = computed(() => {
    const publishers = filtersAllowed.value?.publishers ?? [];
    return [...publishers].sort((a, b) => a.name.localeCompare(b.name));
  });
  const coloristFilterOptions = computed(() => {
    const colorists = filtersAllowed.value?.colorists ?? [];
    return [...colorists].sort((a, b) => a.name.localeCompare(b.name));
  });
  const lettererFilterOptions = computed(() => {
    const letterers = filtersAllowed.value?.letterers ?? [];
    return [...letterers].sort((a, b) => a.name.localeCompare(b.name));
  });
  const editorFilterOptions = computed(() => {
    const editors = filtersAllowed.value?.editors ?? [];
    return [...editors].sort((a, b) => a.name.localeCompare(b.name));
  });
  const coverArtistFilterOptions = computed(() => {
    const coverArtists = filtersAllowed.value?.coverArtists ?? [];
    return [...coverArtists].sort((a, b) => a.name.localeCompare(b.name));
  });

  const selectedGenreNames = computed(() =>
    genreFilterOptions.value.filter((g) => selectedGenres.value.includes(g.id)),
  );
  const selectedYearValues = computed(() =>
    yearFilterOptions.value.filter((year) => selectedYears.value.includes(year)),
  );
  const selectedLetterValues = computed(() =>
    letterFilterOptions.value.filter((letter) => selectedLetters.value.includes(letter)),
  );
  const selectedCharacterNames = computed(() =>
    characterFilterOptions.value.filter((c) => selectedCharacters.value.includes(c.id)),
  );
  const selectedTeamNames = computed(() =>
    teamFilterOptions.value.filter((t) => selectedTeams.value.includes(t.id)),
  );
  const selectedLocationNames = computed(() =>
    locationFilterOptions.value.filter((l) => selectedLocations.value.includes(l.id)),
  );
  const selectedWriterNames = computed(() =>
    writerFilterOptions.value.filter((w) => selectedWriters.value.includes(w.id)),
  );
  const selectedArtistNames = computed(() =>
    artistFilterOptions.value.filter((a) => selectedArtists.value.includes(a.id)),
  );
  const selectedPublisherNames = computed(() =>
    publisherFilterOptions.value.filter((p) => selectedPublishers.value.includes(p.id)),
  );
  const selectedColoristNames = computed(() =>
    coloristFilterOptions.value.filter((c) => selectedColorists.value.includes(c.id)),
  );
  const selectedLettererNames = computed(() =>
    lettererFilterOptions.value.filter((l) => selectedLetterers.value.includes(l.id)),
  );
  const selectedEditorNames = computed(() =>
    editorFilterOptions.value.filter((e) => selectedEditors.value.includes(e.id)),
  );
  const selectedCoverArtistNames = computed(() =>
    coverArtistFilterOptions.value.filter((c) => selectedCoverArtists.value.includes(c.id)),
  );

  const activeFilters = computed<GalleryActiveFilters>(() => ({
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

  const areThereActiveFilters = computed(() =>
    Object.values(activeFilters.value).some((selectedValues) => selectedValues.length > 0),
  );

  const buildFilterParams = () => {
    const filterProperties: string[] = [];
    const filterValues: string[] = [];

    for (const [key, ids] of Object.entries(activeFilters.value) as [keyof GalleryActiveFilters, Array<number | string>][]) {
      const prop = FILTER_PROPERTY_MAP[key];
      for (const id of ids) {
        filterProperties.push(prop);
        filterValues.push(String(id));
      }
    }

    return { filterProperties, filterValues };
  };

  return {
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
  };
}
