
export {
  getPublishersByComicBookId,
  insertComicPublisher,
  linkPublisherToComicBook,
  unlinkPublishersToComicBook,
} from "./comicPublishers.model.ts";
export {
  getGenresForComicBook,
  insertComicGenre,
  linkGenreToComicBook,
  unlinkGenresToComicBook,
} from "./comicGenres.model.ts";
export {
  getStoryArcsByComicBookId,
  unlinkStoryArcsToComicBook,
} from "./comicStoryArcs.model.ts";