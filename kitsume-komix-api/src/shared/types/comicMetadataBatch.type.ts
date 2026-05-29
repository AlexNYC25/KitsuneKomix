import type {
  ComicWriter,
  ComicPenciler,
  ComicInker,
  ComicLetterer,
  ComicEditor,
  ComicColorist,
  ComicCoverArtist,
  ComicPublisher,
  ComicImprint,
  ComicGenre,
  ComicCharacter,
  ComicTeam,
  ComicLocation,
  ComicStoryArc,
  ComicSeriesGroup,
} from "./database.types.ts";

export type ComicBookMetadata = {
  writers?: ComicWriter[];
  pencilers?: ComicPenciler[];
  inkers?: ComicInker[];
  letterers?: ComicLetterer[];
  editors?: ComicEditor[];
  colorists?: ComicColorist[];
  coverArtists?: ComicCoverArtist[];
  publishers?: ComicPublisher[];
  imprints?: ComicImprint[];
  genres?: ComicGenre[];
  characters?: ComicCharacter[];
  teams?: ComicTeam[];
  locations?: ComicLocation[];
  storyArcs?: ComicStoryArc[];
  seriesGroups?: ComicSeriesGroup[];
};

export type BatchMetadataResult = {
  [comicBookId: number]: ComicBookMetadata;
};