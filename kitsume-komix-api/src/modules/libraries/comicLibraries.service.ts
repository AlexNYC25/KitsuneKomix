import {
  getAllComicLibraries,
  getUsersAssignedToLibrary,
  getUsersComicLibraries,
} from "#infrastructure/db/sqlite/models/comicLibraries.model.ts";
import {
  getComicSeriesWithMetadataFilteringSorting,
} from "#infrastructure/db/sqlite/models/comicSeries.model.ts";
import { getUserById } from "#infrastructure/db/sqlite/models/users.model.ts";

import type { ComicBookFilterItem, ComicLibrary, ComicSeries, ComicSeriesFilteringAndSortingParams, ComicSeriesFilterItem, ComicBookFilteringAndSortingParams, ComicBook, User, LibraryCompiledInfo } from "#types/index.ts";
import { getComicBooksWithMetadataFilteringSorting } from "#infrastructure/db/sqlite/models/comicBooks.model.ts";

/**
 * Get the comic libraries that are available to a user.
 * @param userId - ID of the user
 * @returns An array of comic libraries available to the user
 */
export const getComicLibrariesAvailableToUser = async (
  userId: number,
): Promise<Array<LibraryCompiledInfo>> => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const comicLibrariesFromDB: ComicLibrary[] = [];

    if (user.admin) {
      // Admins can see all libraries
      comicLibrariesFromDB.push(...await getAllComicLibraries());
    } else {
      // Regular users can see only libraries they have access to
      comicLibrariesFromDB.push(...await getUsersComicLibraries(userId));
    }

    const compiledInfoReturnList: LibraryCompiledInfo[] = [];

    for(const library of comicLibrariesFromDB) {
      // Perform any additional processing on each library if needed
      const filterByLibrarySeriesFilterObject: ComicSeriesFilterItem = {
        filterProperty: "libraryId",
        filterValue: library.id.toString()
      }
      const filterByLibrarySeriesParam: ComicSeriesFilteringAndSortingParams = {
        filters: [filterByLibrarySeriesFilterObject]
      }
      const seriesBelongingToLibrary: ComicSeries[] = await getComicSeriesWithMetadataFilteringSorting(filterByLibrarySeriesParam);

      const filterByLibraryBooksFilterObject: ComicBookFilterItem = {
        filterProperty: "libraryId",
        filterValue: library.id.toString()
      };
      const filterByLibraryBooksParam: ComicBookFilteringAndSortingParams = {
        filters: [filterByLibraryBooksFilterObject]
      };
      const booksBelongingToLibrary: ComicBook[] = await getComicBooksWithMetadataFilteringSorting(filterByLibraryBooksParam);

      const usersAssignedToLibrary: User[] = await getUsersAssignedToLibrary(library.id);

      const compiledInfo: LibraryCompiledInfo = {
        ...library,
        totalNumberOfSeries: seriesBelongingToLibrary.length,
        totalNumberOfBooks: booksBelongingToLibrary.length,
        totalNumberOfUsers: usersAssignedToLibrary.length,
        totalSize: booksBelongingToLibrary.reduce((acc, book) => acc + (book.fileSize ?? 0), 0)
      };

      compiledInfoReturnList.push(compiledInfo);
    }


    return compiledInfoReturnList;
  } catch (error) {
    console.error("Error fetching comic libraries:", error);
    return [];
  }
};
