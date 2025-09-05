
export type ComicSeriesRow = {
  id: number;
  name: string;
  description: string | null;
  folder_path: string
	created_at: string;
	updated_at: string;
};

export type ComicSeriesDomain = {
	id: number;
	name: string;
	description?: string;
	folderPath: string;
	createdAt: string;
	updatedAt: string;
};

export type NewComicSeries = {
	name: string;
	description?: string | null;
	folderPath?: string;
};

export type ComicSeriesUpdate = Partial<NewComicSeries>;

export type ComicSeriesSearchParams = {
	name?: string;
	folderPath?: string;
};