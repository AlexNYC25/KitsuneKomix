import type { paths } from '../openapi/openapi-schema';

// /comic-books/series/:seriesId endpoint types
export type GetComicsBySeries = paths['/comic-books/series/:seriesId']['get']['responses']['200']['content']['application/json'];

export type ComicBookInSeriesData = GetComicsBySeries['data'];

export type ComicBook = ComicBookInSeriesData[number];

export type ComicBooksSeriesMeta = GetComicsBySeries['meta'];

export type ComicBooksSeriesResponse = GetComicsBySeries;

// Creator/Person interface for metadata fields
export interface Creator {
	id: number;
	name: string;
}

// /comic-books/:id/metadata endpoint types
export interface ComicBookMetadata {
	id: number;
	issueNumber: number;
	title: string;
	description?: string | null;
	publicationDate?: string | null;
	pageCount: number;
	filePath: string;
	series?: string | null;
	writers: Creator[];
	pencillers: Creator[];
	inkers: Creator[];
	letterers: Creator[];
	colorists: Creator[];
	editors: Creator[];
	coverArtists: Creator[];
	publishers: Creator[];
	imprints: Creator[];
	genres: Creator[];
	characters: Creator[];
	teams: Creator[];
	locations: Creator[];
	storyArcs: Creator[];
	seriesGroups: Creator[];
}
