import type { paths } from '@/openapi/openapi-schema';

// /comic-books/ endpoint types - Used for fetching comics by series via filterProperty=seriesId
export type GetComicsBySeries = paths['/comic-books']['get']['responses']['200']['content']['application/json'];

export type ComicBookInSeriesData = GetComicsBySeries['data'];

export type ComicBook = ComicBookInSeriesData[number];

export type ComicBooksSeriesMeta = GetComicsBySeries['meta'];

export type ComicBooksSeriesResponse = GetComicsBySeries;

// Creator/Person interface for metadata fields
export interface Creator {
	id: number;
	name: string;
}

// /comic-books/{id}/metadata endpoint types - derived from OpenAPI schema
export type ComicBookMetadata = paths['/comic-books/{id}/metadata']['get']['responses']['200']['content']['application/json'];

// /comic-books/{id} endpoint types - base comic book details
export type ComicBookById = paths['/comic-books/{id}']['get']['responses']['200']['content']['application/json'];

// /comic-books/{id}/readlists endpoint types
export type GetComicBookReadlistsResponse = paths['/comic-books/{id}/readlists']['get']['responses']['200']['content']['application/json'];
export type ComicBookReadlist = NonNullable<GetComicBookReadlistsResponse>['readLists'][number];

// /comic-books/{id}/thumbnails endpoint types
export type GetComicBookThumbnailsResponse = paths['/comic-books/{id}/thumbnails']['get']['responses']['200']['content']['application/json'];

export type ComicBookThumbnailsData = GetComicBookThumbnailsResponse['thumbnails'];

export type ComicBookThumbnail = ComicBookThumbnailsData[number];

// /comic-books/filter-values
export type GetComicBooksFilterValuesResponse = paths['/comic-books/filter-values']['get']['responses']['200']['content']['application/json'];

export type ComicBooksFilterValuesData = GetComicBooksFilterValuesResponse['data'];

export type ComicBookWriterValues = NonNullable<ComicBooksFilterValuesData['writers']>[number];

export type ComicBookPencillerValues = NonNullable<ComicBooksFilterValuesData['pencillers']>[number];

export type ComicBookInkerValues = NonNullable<ComicBooksFilterValuesData['inkers']>[number];

export type ComicBookColoristValues = NonNullable<ComicBooksFilterValuesData['colorists']>[number];

export type ComicBookLettererValues = NonNullable<ComicBooksFilterValuesData['letterers']>[number];

export type ComicBookEditorValues = NonNullable<ComicBooksFilterValuesData['editors']>[number];

export type ComicBookCoverArtistValues = NonNullable<ComicBooksFilterValuesData['coverArtists']>[number];

export type ComicBookPublisherValues = NonNullable<ComicBooksFilterValuesData['publishers']>[number];

export type ComicBookImprintValues = NonNullable<ComicBooksFilterValuesData['imprints']>[number];

export type ComicBookGenreValues = NonNullable<ComicBooksFilterValuesData['genres']>[number];

export type ComicBookCharacterValues = NonNullable<ComicBooksFilterValuesData['characters']>[number];

export type ComicBookTeamValues = NonNullable<ComicBooksFilterValuesData['teams']>[number];

export type ComicBookLocationValues = NonNullable<ComicBooksFilterValuesData['locations']>[number];

export type ComicBookStoryArcValues = NonNullable<ComicBooksFilterValuesData['storyArcs']>[number];

export type ComicBookSeriesGroupValues = NonNullable<ComicBooksFilterValuesData['seriesGroups']>[number];

export type ComicBookYearValues = NonNullable<ComicBooksFilterValuesData['years']>[number];

export type ComicBookLetterValues = NonNullable<ComicBooksFilterValuesData['letters']>[number];