import type { ComicBookById, ComicBookMetadata } from '@/types/comic-books.types';

export interface ComicReaderProps {
	/** ID of the comic book to read */
	comicBookId: number;
	/** Display title shown in the top bar */
	comicTitle: string;
	/** Optional comic data for title extraction in the reader header */
	comicBookData?: ComicBookById | ComicBookMetadata;
}
