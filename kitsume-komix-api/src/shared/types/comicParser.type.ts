
export type ComicSeriesDetails = {
  series: string;
  volume?: string;
  count?: string;
  year?: string;
};

export type ComicFileDetails = ComicSeriesDetails & {
  issue: string;
};