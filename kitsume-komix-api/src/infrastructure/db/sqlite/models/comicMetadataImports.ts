export {
  getWritersByComicBookId,
  insertComicWriter,
  linkWriterToComicBook,
  unlinkWritersToComicBook,
} from "#infrastructure/db/sqlite/models/comicWriters.model.ts";
export {
  getPencilersByComicBookId,
  insertComicPenciler,
  linkPencilerToComicBook,
  unlinkPencilersToComicBook,
} from "#infrastructure/db/sqlite/models/comicPencilers.model.ts";
export {
  getInkersByComicBookId,
  insertComicInker,
  linkInkerToComicBook,
  unlinkInkersToComicBook,
} from "#infrastructure/db/sqlite/models/comicInkers.model.ts";
export {
  getLetterersByComicBookId,
  insertComicLetterer,
  linkLettererToComicBook,
  unlinkLetterersToComicBook,
} from "#infrastructure/db/sqlite/models/comicLetterers.model.ts";
export {
  getEditorsByComicBookId,
  insertComicEditor,
  linkEditorToComicBook,
  unlinkEditorsToComicBook,
} from "#infrastructure/db/sqlite/models/comicEditors.model.ts";
export {
  getColoristByComicBookId,
  insertComicColorist,
  linkColoristToComicBook,
  unlinkColoristsToComicBook,
} from "#infrastructure/db/sqlite/models/comicColorists.model.ts";
export {
  getCoverArtistsByComicBookId,
  insertComicCoverArtist,
  linkCoverArtistToComicBook,
  unlinkCoverArtistsToComicBook,
} from "#infrastructure/db/sqlite/models/comicCoverArtists.model.ts";
export {
  getPublishersByComicBookId,
  insertComicPublisher,
  linkPublisherToComicBook,
  unlinkPublishersToComicBook,
} from "#infrastructure/db/sqlite/models/comicPublishers.model.ts";
export {
  getImprintsByComicBookId,
  insertComicImprint,
  linkImprintToComicBook,
  unlinkImprintsToComicBook,
} from "#infrastructure/db/sqlite/models/comicImprints.model.ts";
export {
  getGenresForComicBook,
  insertComicGenre,
  linkGenreToComicBook,
  unlinkGenresToComicBook,
} from "#infrastructure/db/sqlite/models/comicGenres.model.ts";
export {
  getCharactersByComicBookId,
  insertComicCharacter,
  linkCharacterToComicBook,
  unlinkCharactersToComicBook,
} from "#infrastructure/db/sqlite/models/comicCharacters.model.ts";
export {
  getTeamsByComicBookId,
  insertComicTeam,
  linkTeamToComicBook,
  unlinkTeamsToComicBook,
} from "#infrastructure/db/sqlite/models/comicTeams.model.ts";
export {
  getLocationsByComicBookId,
  insertComicLocation,
  linkLocationToComicBook,
  unlinkLocationsToComicBook,
} from "#infrastructure/db/sqlite/models/comicLocations.model.ts";
export {
  getStoryArcsByComicBookId,
  unlinkStoryArcsToComicBook,
} from "#infrastructure/db/sqlite/models/comicStoryArcs.model.ts";