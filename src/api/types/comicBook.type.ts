export type ComicBookRow = {
  id: number;
  library_id: number;
	file_path: string;
	title: string;
	series: string | null;
	issue_number: string | null;
	volume: string | null;
	publisher: string | null;
	publication_date: string | null;
	tags: string | null;
	read: boolean;
	created_at: string;
	updated_at: string;
};

export type ComicBookDomain = {
	id: number;
	libraryId: number;
	filePath: string;
	title: string;
	series?: string;
	issueNumber?: string;
	volume?: string;
	publisher?: string;
	publicationDate?: string;
	tags?: string[]; // Array of tags
	read: boolean;
	createdAt: string;
	updatedAt: string;
};

export type NewComicBook = {
  title: string;
  issueNumber?: string;
  volume?: string;
  series?: string;
  publisher?: string;
  tags?: string[]; // Array of tags
  filePath: string;
  metadata?: Record<string, unknown>; // Additional metadata as an object
	publicationDate?: string;
  libraryId: number;
};

export type ComicBookUpdate = Partial<NewComicBook>;

export type ComicBookSearchParams = {
  title?: string;
  series?: string;
  publisher?: string;
  tags?: string[];
  libraryId?: number;
};