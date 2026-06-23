import type { GalleryFilterKey } from '@/types/comic-series.types';

export const PAGE_SIZE_OPTIONS = [4, 10, 20, 25, 30, 40, 50, 100] as const;

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Latest' },
  { value: 'updatedAt', label: 'Recently Updated' },
  { value: 'name', label: 'Name' },
  { value: 'publicationDate', label: 'Publication Date' },
] as const;

export const ROUTE_SORT_CATEGORY_MAP: Record<string, string> = {
  '/comic-series/latest': 'createdAt',
  '/comic-series/updated': 'updatedAt',
  '/comic-series/list': 'name',
  '/comic-books/latest': 'createdAt',
  '/comic-books/updated': 'updatedAt',
  '/comic-books/list': 'name',
};

export const FILTER_PROPERTY_MAP: Record<GalleryFilterKey, string> = {
  genres: 'genreId',
  years: 'year',
  letters: 'letter',
  characters: 'characterId',
  teams: 'teamId',
  locations: 'locationId',
  writers: 'writerId',
  artists: 'pencilerId',
  publishers: 'publisherId',
  colorists: 'coloristId',
  letterers: 'lettererId',
  editors: 'editorId',
  coverArtists: 'coverArtistId',
};
