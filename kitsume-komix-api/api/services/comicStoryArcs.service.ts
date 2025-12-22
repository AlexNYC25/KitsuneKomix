import { getAllComicStoryArcs, getComicStoryArcById, insertComicStoryArc, deleteComicStoryArcById } from "#sqlite/models/comicStoryArcs.model.ts";

import { validatePaginationParameters, buildStoryArcQueryParams } from "#utilities/parameters.ts";

import { ComicStoryArcQueryParams } from "#interfaces/index.ts";

import {
	// Filter and sort types   
  RequestFilterParameters,
  // Request parameter types
  RequestPaginationParameters,
  RequestPaginationParametersValidated,
  RequestSortParameters,
  ComicStoryArc,
 } from "#types/index.ts";

export const fetchAllComicStoryArcs = async (
	requestPaginationParameters: RequestPaginationParameters,
  requestFilterParameters: RequestFilterParameters,
  requestSortParameters: RequestSortParameters,
) => {
  // Set default pagination values
  const validatedPaginationParameters: RequestPaginationParametersValidated = validatePaginationParameters(requestPaginationParameters);

  const queryParams: ComicStoryArcQueryParams = buildStoryArcQueryParams(
    validatedPaginationParameters,
    requestFilterParameters,
    requestSortParameters
  );

  try {
    const storyArcs = await getAllComicStoryArcs(queryParams);

    const hasNextPage =
      storyArcs.length > validatedPaginationParameters.pageSize;
    if (hasNextPage) {
      storyArcs.pop();
    }
    return {
      storyArcs,
      hasNextPage,
      currentPage: validatedPaginationParameters.page,
      pageSize: validatedPaginationParameters.pageSize,
      totalResults: storyArcs.length,
      isFiltered: Boolean(requestFilterParameters.filter),
      isSorted: Boolean(requestSortParameters.sortProperty),
    };
  } catch (error) {
    console.error("Error fetching all comic story arcs:", error);
    return null;
  }
}

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
    const newStoryArcId = await insertComicStoryArc(newStoryArc.name, newStoryArc.description ?? undefined);
    const newStoryArcRecord = await getComicStoryArcById(newStoryArcId);
    return newStoryArcRecord;
  } catch (error) {
    console.error("Error adding new comic story arc:", error);
    return null;
  }
};

export const downloadComicsInStoryArc = async (
  storyArcId: number,
): Promise<boolean> => {
  // Implementation for downloading comics in a story arc would go here
  return false;
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