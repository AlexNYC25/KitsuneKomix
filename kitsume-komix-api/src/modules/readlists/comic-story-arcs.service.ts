import { apiLogger } from "#logger/loggers.ts";

import { fetchComicBooksWithRelatedMetadata } from "#modules/comics/index.ts";
import {
  deleteComicStoryArcById,
  getComicStoryArcById,
  getComicStoryArcsFilteringSorting,
  insertComicStoryArc,
} from "#infrastructure/db/sqlite/models/comicStoryArcs.model.ts";

import {
  validateAndBuildQueryParams,
  validatePagination,
  VALIDATE_COMIC_KEY
} from "#utilities/parameters.ts";

import type {
  ComicReadlistsFilterField,
  ComicReadlistsSortField,
  ComicStoryArc,
  ComicStoryArcFilterItem,
  // Filter and sort types
  RequestFilterParametersValidated,
  // Request parameter types
  RequestPaginationParametersValidated,
  //
  RequestParametersValidated,
  RequestSortParametersValidated,
  ComicBook,
  ComicSortField,
  ComicFilterField,
  QueryDataMultiFilter,
  ComicBookFilterItem,
  ComicStoryArcWithComicIds,
  ComicBookWithMetadata,
  ComicStoryArcWithComicBooks
} from "#types/index.ts";

export const fetchComicStoryArcs = async (
  queryData: RequestParametersValidated<
    ComicReadlistsSortField,
    ComicReadlistsFilterField
  >,
  userId: number
): Promise<ComicStoryArcWithComicBooks[]> => {
  const serviceDataPagination: RequestPaginationParametersValidated =
    queryData.pagination;
  const serviceDataFilter:
    | RequestFilterParametersValidated<ComicReadlistsFilterField>
    | undefined = queryData.filter;
  const serviceDataSort: RequestSortParametersValidated<
    ComicReadlistsSortField
  > = queryData.sort;

  const comicStoryArcs: ComicStoryArc[] = await getComicStoryArcsFilteringSorting({
    filters: [serviceDataFilter] as ComicStoryArcFilterItem[],
    sort: {
      property: serviceDataSort.sortProperty,
      order: serviceDataSort.sortOrder,
    },
    offset: serviceDataPagination.pageNumber * serviceDataPagination.pageSize -
      serviceDataPagination.pageSize,
    limit: serviceDataPagination.pageSize + 1,
  });

  const comicStoryArcsFormatted: ComicStoryArcWithComicBooks[] = [];

  for (const arc of comicStoryArcs) {
    // we need to fetch the comic in the story arc
    const serviceParametersDataForComicsInStoryArc: QueryDataMultiFilter = {
      page: 0,
      pageSize: 9999, // we want to fetch all comics in the story arc, so we set a very high page size
      sort: "storyArcPosition",
      sortDirection: "asc",
      filter: "comicStoryArcId",
      filterProperty: arc.id.toString(),
    }
    
    const subServiceData: RequestParametersValidated< ComicSortField, ComicFilterField > = validateAndBuildQueryParams(serviceParametersDataForComicsInStoryArc, VALIDATE_COMIC_KEY);

    const comicBooksInStoryArc: ComicBookWithMetadata[] = await fetchComicBooksWithRelatedMetadata(subServiceData, userId);

    // we specifically want the total count of comics
    const totalCountOfComicsInStoryArc = comicBooksInStoryArc.length;

    // calculate the total size of the readlist/story arc
    const totalSizeOfStoryArc = comicBooksInStoryArc.reduce((totalSize, comicBook) => {
      return totalSize + (comicBook.fileSize || 0);
    }, 0);

    const totalBookBeingReadInStoryArc = comicBooksInStoryArc.filter((comicBook) => comicBook.lastReadPage).length;

    const totalBooksTheUserHasReadInStoryArc = comicBooksInStoryArc.filter((comicBook) => comicBook.read).length;

    comicStoryArcsFormatted.push({
      ...arc,
      comicBooks: comicBooksInStoryArc,
      totalNumberOfComics: totalCountOfComicsInStoryArc,
      totalSizeOfStoryArc: totalSizeOfStoryArc,
      numberOfComicsBeingReadByUser: totalBookBeingReadInStoryArc,
      numberOfComicsReadByUser: totalBooksTheUserHasReadInStoryArc
    });
  }

  return comicStoryArcsFormatted;
};

export const fetchComicStoryArcById = async (
  storyArcId: number,
): Promise<ComicStoryArc | null> => {
  try {
    const storyArc = await getComicStoryArcById(storyArcId);
    return storyArc;
  } catch (error) {
    apiLogger.error("Error fetching comic story arc by ID:" + error);
    return null;
  }
};

export const addComicStoryArc = async (
  newStoryArc: Omit<ComicStoryArc, "id" | "createdAt" | "updatedAt">,
): Promise<ComicStoryArc | null> => {
  try {
    const newStoryArcId = await insertComicStoryArc(
      newStoryArc.name,
      newStoryArc.description ?? undefined,
    );
    const newStoryArcRecord = await getComicStoryArcById(newStoryArcId);
    return newStoryArcRecord;
  } catch (error) {
    apiLogger.error("Error adding new comic story arc:" + error);
    return null;
  }
};

export const deleteComicStoryArc = async (
  storyArcId: number,
): Promise<boolean> => {
  try {
    await deleteComicStoryArcById(storyArcId);
  } catch (error) {
    apiLogger.error("Error deleting comic story arc:" + error);
    return false;
  }

  return true;
};
