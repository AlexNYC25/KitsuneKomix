import {
  deleteComicStoryArcById,
  getComicStoryArcById,
  getComicStoryArcsFilteringSorting,
  insertComicStoryArc,
} from "#sqlite/models/comicStoryArcs.model.ts";

import { ComicStoryArcQueryParams } from "#interfaces/index.ts";

import {
  ComicReadlistsFilterField,
  ComicReadlistsSortField,
  ComicStoryArc,
  ComicStoryArcFilterItem,
  // Filter and sort types
  RequestFilterParameters,
  RequestFilterParametersValidated,
  // Request parameter types
  RequestPaginationParametersValidated,
  //
  RequestParametersValidated,
  RequestSortParameters,
  RequestSortParametersValidated,
} from "#types/index.ts";

export const fetchComicStoryArcs = async (
  queryData: RequestParametersValidated<
    ComicReadlistsSortField,
    ComicReadlistsFilterField
  >,
) => {
  const serviceDataPagination: RequestPaginationParametersValidated =
    queryData.pagination;
  const serviceDataFilter:
    | RequestFilterParametersValidated<ComicReadlistsFilterField>
    | undefined = queryData.filter;
  const serviceDataSort: RequestSortParametersValidated<
    ComicReadlistsSortField
  > = queryData.sort;

  const comicStoryArcs = await getComicStoryArcsFilteringSorting({
    filters: [serviceDataFilter] as ComicStoryArcFilterItem[],
    sort: {
      property: serviceDataSort.sortProperty,
      order: serviceDataSort.sortOrder,
    },
    offset: serviceDataPagination.pageNumber * serviceDataPagination.pageSize -
      serviceDataPagination.pageSize,
    limit: serviceDataPagination.pageSize + 1,
  });

  return comicStoryArcs;
};

export const fetchComicStoryArcById = async (
  storyArcId: number,
): Promise<ComicStoryArc | null> => {
  try {
    const storyArc = await getComicStoryArcById(storyArcId);
    return storyArc;
  } catch (error) {
    console.error("Error fetching comic story arc by ID:", error);
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
    console.error("Error adding new comic story arc:", error);
    return null;
  }
};

export const deleteComicStoryArc = async (
  storyArcId: number,
): Promise<boolean> => {
  try {
    await deleteComicStoryArcById(storyArcId);
  } catch (error) {
    console.error("Error deleting comic story arc:", error);
    return false;
  }

  return true;
};
