import type { paths } from '@/openapi/openapi-schema';

// /comic-series/ endpoint types
export type GetComicSeriesResponse = paths['/comic-series']['get']['responses']['200']['content']['application/json'];

export type ComicSeriesListData = GetComicSeriesResponse['data'];

export type ComicSeriesListItem = ComicSeriesListData[number];

// /comic-series/{id} endpoint types
export type GetComicSeriesByIdResponse = paths['/comic-series/{id}']['get']['responses']['200']['content']['application/json'];

export type ComicSeriesWithComics = GetComicSeriesByIdResponse['data'];

export type ComicSeriesResponseItem = ComicSeriesWithComics[number];

export type ComicSeriesComic = NonNullable<ComicSeriesResponseItem['comicBooks']>[number];

export type ComicSeriesWithComicsSingleComic = ComicSeriesComic;

// /comic-series/latest endpoint types
export type GetLatestComicSeriesResponse = paths['/comic-series/latest']['get']['responses']['200']['content']['application/json'];

export type LatestComicSeriesData = GetLatestComicSeriesResponse['data'];

export type LatestComicSeriesSingle = LatestComicSeriesData[number];

export type LatestComicSeriesMeta = GetLatestComicSeriesResponse['meta'];

// /comic-series/updated endpoint types
export type GetUpdatedComicSeriesResponse = paths['/comic-series/updated']['get']['responses']['200']['content']['application/json'];

export type UpdatedComicSeriesData = GetUpdatedComicSeriesResponse['data'];

export type UpdatedComicSeriesSingle = UpdatedComicSeriesData[number];

export type UpdatedComicSeriesMeta = GetUpdatedComicSeriesResponse['meta'];

// Minimal shape required to render a comic series in the carousel.
// Derived from LatestComicSeriesSingle which shares the same structure as UpdatedComicSeriesSingle.
export type ComicSeriesCarouselItem = Pick<LatestComicSeriesSingle, 'id' | 'name' | 'thumbnailUrl'>;

// /comic-series/filter-values
export type GetComicSeriesFilterValuesResponse = paths['/comic-series/filter-values']['get']['responses']['200']['content']['application/json'];

export type ComicSeriesFilterValuesData = GetComicSeriesFilterValuesResponse['data'];

// These definitions can be used as comic book metadata types as well, we use the same data just compile it into 
// arrays for the series 
export type ComicSeriesFilterWritersValues = NonNullable<ComicSeriesFilterValuesData['writers']>;
export type ComicSeriesFilterWriter = ComicSeriesFilterWritersValues[number];

export type ComicSeriesFilterPencillersValues = NonNullable<ComicSeriesFilterValuesData['pencillers']>;
export type ComicSeriesFilterPencillers = ComicSeriesFilterPencillersValues[number];

export type ComicSeriesFilterInkersValues = NonNullable<ComicSeriesFilterValuesData['inkers']>;
export type ComicSeriesFilterInker = ComicSeriesFilterInkersValues[number];

export type ComicSeriesFilterColoristsValues = NonNullable<ComicSeriesFilterValuesData['colorists']>;
export type ComicSeriesFilterColorist = ComicSeriesFilterColoristsValues[number];

export type ComicSeriesFilterLetterersValues = NonNullable<ComicSeriesFilterValuesData['letterers']>;
export type ComicSeriesFilterLetterer = ComicSeriesFilterLetterersValues[number];

export type ComicSeriesFilterEditorsValues = NonNullable<ComicSeriesFilterValuesData['editors']>;
export type ComicSeriesFilterEditor = ComicSeriesFilterEditorsValues[number];

export type ComicSeriesFilterCoverArtistsValues = NonNullable<ComicSeriesFilterValuesData['coverArtists']>;
export type ComicSeriesFilterCoverArtist = ComicSeriesFilterCoverArtistsValues[number];

export type ComicSeriesFilterPublishersValues = NonNullable<ComicSeriesFilterValuesData['publishers']>;
export type ComicSeriesFilterPublisher = ComicSeriesFilterPublishersValues[number];

export type ComicSeriesFilterImprintsValues = NonNullable<ComicSeriesFilterValuesData['imprints']>;
export type ComicSeriesFilterImprint = ComicSeriesFilterImprintsValues[number];

export type ComicSeriesFilterGenresValues = NonNullable<ComicSeriesFilterValuesData['genres']>;
export type ComicSeriesFilterGenre = ComicSeriesFilterGenresValues[number];

export type ComicSeriesFilterCharactersValues = NonNullable<ComicSeriesFilterValuesData['characters']>;
export type ComicSeriesFilterCharacter = ComicSeriesFilterCharactersValues[number];

export type ComicSeriesFilterTeamsValues = NonNullable<ComicSeriesFilterValuesData['teams']>;
export type ComicSeriesFilterTeam = ComicSeriesFilterTeamsValues[number];

export type ComicSeriesFilterLocationsValues = NonNullable<ComicSeriesFilterValuesData['locations']>;
export type ComicSeriesFilterLocation = ComicSeriesFilterLocationsValues[number];

export type ComicSeriesFilterStoryArcsValues = NonNullable<ComicSeriesFilterValuesData['storyArcs']>;
export type ComicSeriesFilterStoryArc = ComicSeriesFilterStoryArcsValues[number];

export type ComicSeriesFilterSeriesGroupsValues = NonNullable<ComicSeriesFilterValuesData['seriesGroups']>;
export type ComicSeriesFilterSeriesGroup = ComicSeriesFilterSeriesGroupsValues[number];

export type ComicSeriesFilterYearsValues = NonNullable<ComicSeriesFilterValuesData['years']>;
export type ComicSeriesFilterYear = ComicSeriesFilterYearsValues[number];
