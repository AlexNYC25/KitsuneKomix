import { getClient } from "../db/sqlite/client.ts";

import { ComicBook, ComicPenciller, ComicWriter, ComicInker, ComicLetterer, ComicEditor, ComicColorist, ComicCoverArtist, ComicPublisher, ComicImprint, ComicGenre, ComicCharacter, ComicLocation, ComicTeam, ComicStoryArc, ComicSeriesGroup, ComicBookWithMetadata } from "../types/index.ts";
import { getAllComicBooks, getComicBookById } from "../db/sqlite/models/comicBooks.model.ts";

import { getWritersByComicBookId } from "../db/sqlite/models/comicWriters.model.ts";
import { getColoristByComicBookId } from "../db/sqlite/models/comicColorists.model.ts";
import { getPencillersByComicBookId } from "../db/sqlite/models/comicPencillers.model.ts";
import { getInkersByComicBookId } from "../db/sqlite/models/comicInkers.model.ts";
import { getLetterersByComicBookId } from "../db/sqlite/models/comicLetterers.model.ts";
import { getEditorsByComicBookId } from "../db/sqlite/models/comicEditors.model.ts";
import { getCoverArtistsByComicBookId } from "../db/sqlite/models/comicCoverArtists.model.ts";

import { getPublishersByComicBookId } from "../db/sqlite/models/comicPublishers.model.ts";
import { getImprintsByComicBookId } from "../db/sqlite/models/comicImprints.model.ts";

import { getGenresForComicBook } from "../db/sqlite/models/comicGenres.model.ts";
import { getCharactersByComicBookId } from "../db/sqlite/models/comicCharacters.model.ts";
import { getTeamsByComicBookId } from "../db/sqlite/models/comicTeams.model.ts";
import { getLocationsByComicBookId} from "../db/sqlite/models/comicLocations.model.ts";

import { getStoryArcsByComicBookId } from "../db/sqlite/models/comicStoryArcs.model.ts";
import { getSeriesGroupsByComicBookId } from "../db/sqlite/models/comicSeriesGroups.model.ts";

export const fetchAllComicBooksWithRelatedData = async (page: number = 1, limit: number = 100, sort: string | undefined, filter?: string | undefined, filter_property?: string | undefined) => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  const offset = (page - 1) * limit;
	const limitPlusOne = limit + 1; // Fetch one extra to check if there's a next page
  const sortOrder = sort === "asc" ? "asc" : "desc";

  // Basic filtering logic (can be expanded as needed)
  const filterCondition = filter && filter_property
    ? (book: ComicBook) => book[filter_property as keyof ComicBook] && book[filter_property as keyof ComicBook]?.toString().includes(filter)
    : () => true;

  try {    
    const books: ComicBook[] = await getAllComicBooks(offset, limitPlusOne, sortOrder);
        
		const booksWithMetadata: ComicBookWithMetadata[] = [];

    for (const book of books) {
			const comicBookWithMetadata: ComicBookWithMetadata = { ...book } as ComicBookWithMetadata;

      // Fetch and attach related data (authors, artists, genres, etc.) here if needed
      // This is a placeholder for actual implementation
      const writers: ComicWriter[] = await getWritersByComicBookId(book.id);
      const pencillers: ComicPenciller[] = await getPencillersByComicBookId(book.id);
      const inkers: ComicInker[] = await getInkersByComicBookId(book.id);
      const letterers: ComicLetterer[] = await getLetterersByComicBookId(book.id);
      const editors: ComicEditor[] = await getEditorsByComicBookId(book.id);
      const colorists: ComicColorist[] = await getColoristByComicBookId(book.id);
      const coverArtists: ComicCoverArtist[] = await getCoverArtistsByComicBookId(book.id);

      const publishers: ComicPublisher[] = await getPublishersByComicBookId(book.id);
      const imprints: ComicImprint[] = await getImprintsByComicBookId(book.id);

      const genres: ComicGenre[] = await getGenresForComicBook(book.id);
      const characters: ComicCharacter[] = await getCharactersByComicBookId(book.id);
      const teams: ComicTeam[] = await getTeamsByComicBookId(book.id);
      const locations: ComicLocation[] = await getLocationsByComicBookId(book.id);

      const storyArcs: ComicStoryArc[] = await getStoryArcsByComicBookId(book.id);
      const seriesGroups: ComicSeriesGroup[] = await getSeriesGroupsByComicBookId(book.id);

      comicBookWithMetadata.writers = writers;
      comicBookWithMetadata.pencillers = pencillers;
      comicBookWithMetadata.inkers = inkers;
      comicBookWithMetadata.letterers = letterers;
      comicBookWithMetadata.editors = editors;
      comicBookWithMetadata.colorists = colorists;
      comicBookWithMetadata.coverArtists = coverArtists;
      comicBookWithMetadata.publishers = publishers;
      comicBookWithMetadata.imprints = imprints;
      comicBookWithMetadata.genres = genres;
      comicBookWithMetadata.characters = characters;
      comicBookWithMetadata.teams = teams;
      comicBookWithMetadata.locations = locations;
      comicBookWithMetadata.storyArcs = storyArcs;
      comicBookWithMetadata.seriesGroups = seriesGroups;

			booksWithMetadata.push(comicBookWithMetadata);
    }

    // Apply filtering
		const filteredBooks = booksWithMetadata.filter(filterCondition);

    console.log("Service Debug - After filtering:", { 
      filteredBooksLength: filteredBooks.length, 
      finalResult: filteredBooks.slice(0, limit).length,
      filter,
      filter_property 
    });

    // Return paginated and filtered results
    return {
			comics: filteredBooks.slice(0, limit), // Return only the requested limit
			hasNextPage: filteredBooks.length > limit, // Indicate if there's a next page
		};
  } catch (error) {
    console.error("Error fetching all comic books:", error);
    throw error;
  }
};

export const fetchComicBookMetadataById = async (id: number): Promise<ComicBookWithMetadata | null> => {
	const { db, client } = getClient();

	if (!db || !client) {
		throw new Error("Database is not initialized.");
	}

	try {
		const comicBook = await getComicBookById(id);
		if (!comicBook) {
			return null;
		}

		const metadata: ComicBookWithMetadata = {
			...comicBook,
			writers: await getWritersByComicBookId(id),
			pencillers: await getPencillersByComicBookId(id),
			inkers: await getInkersByComicBookId(id),
			letterers: await getLetterersByComicBookId(id),
			editors: await getEditorsByComicBookId(id),
			colorists: await getColoristByComicBookId(id),
			coverArtists: await getCoverArtistsByComicBookId(id),
			publishers: await getPublishersByComicBookId(id),
			imprints: await getImprintsByComicBookId(id),
			genres: await getGenresForComicBook(id),
			characters: await getCharactersByComicBookId(id),
			teams: await getTeamsByComicBookId(id),
			locations: await getLocationsByComicBookId(id),
			storyArcs: await getStoryArcsByComicBookId(id),
			seriesGroups: await getSeriesGroupsByComicBookId(id),
		};

		return metadata;
	} catch (error) {
		console.error("Error fetching comic book metadata:", error);
		throw error;
	}
};