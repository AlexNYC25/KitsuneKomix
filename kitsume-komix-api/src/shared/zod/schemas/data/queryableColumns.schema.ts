import { z } from "zod";

const asNonEmptyTuple = <T extends string>(
	values: readonly [T, ...T[]],
): readonly [T, ...T[]] => values;

/**
 * Canonical allow-list for queryable filter/sort fields by domain.
 *
 * Keep this object updated when adding or removing queryable fields.
 * All zod schemas and TypeScript field types derive from this config.
 */
export const QueryableDomainFieldConfig = {
	comics: {
		filter: asNonEmptyTuple([
			"id",
			"seriesId",
			"hash",
			"duplicateHash",
			"title",
			"series",
			"issueNumber",
			"volume",
			"alternateSeries",
			"alternateIssueNumber",
			"fileSize",
			"summary",
			"notes",
			"year",
			"month",
			"day",
			"date",
			"publisher",
			"publicationDate",
			"scanInfo",
			"language",
			"format",
			"blackAndWhite",
			"manga",
			"readingDirection",
			"review",
			"ageRating",
			"communityRating",
			"createdAt",
			"updatedAt",
			"listLetter",
			"libraryId",
      "storyArcId",
      "seriesGroupId",
		]),
		sort: asNonEmptyTuple([
			"title",
			"issueNumber",
			"volume",
			"alternateSeries",
			"alternateIssueNumber",
			"fileSize",
			"year",
			"month",
			"day",
			"date",
			"publisher",
			"publicationDate",
			"language",
			"format",
			"blackAndWhite",
			"manga",
			"readingDirection",
			"ageRating",
			"communityRating",
			"createdAt",
			"updatedAt",
      "storyArcPosition",
      "seriesGroupPosition",
		]),
	},
	comicSeries: {
		filter: asNonEmptyTuple([
			"id",
			"name",
			"description",
			"libraryId",
			"letter",
			"year",
			"genreId",
			"characterId",
			"teamId",
			"locationId",
			"writerId",
			"pencilerId",
			"publisherId",
			"coloristId",
			"lettererId",
			"editorId",
			"coverArtistId",
		]),
		sort: asNonEmptyTuple([
			"id",
			"name",
			"createdAt",
			"updatedAt",
			"publicationDate",
		]),
	},
	comicReadlists: {
		filter: asNonEmptyTuple([
			"id",
			"name",
			"description",
		]),
		sort: asNonEmptyTuple([
			"id",
			"name",
			"createdAt",
			"updatedAt",
		]),
	},
	comicSeriesGroups: {
		filter: asNonEmptyTuple([
			"id",
			"name",
			"description",
		]),
		sort: asNonEmptyTuple([
			"id",
			"name",
			"createdAt",
			"updatedAt",
		]),
	},
} as const;

export type QueryableDomain = keyof typeof QueryableDomainFieldConfig;

export type QueryableFilterField<TDomain extends QueryableDomain> =
	(typeof QueryableDomainFieldConfig)[TDomain]["filter"][number];

export type QueryableSortField<TDomain extends QueryableDomain> =
	(typeof QueryableDomainFieldConfig)[TDomain]["sort"][number];

export const AllowedComicFiltersSchema = z.enum(
	QueryableDomainFieldConfig.comics.filter,
);

export const AllowedComicSortSchema = z.enum(
	QueryableDomainFieldConfig.comics.sort,
);

export const AllowedComicSeriesFiltersSchema = z.enum(
	QueryableDomainFieldConfig.comicSeries.filter,
);

export const AllowedComicSeriesSortSchema = z.enum(
	QueryableDomainFieldConfig.comicSeries.sort,
);

export const AllowedComicReadlistsFiltersSchema = z.enum(
	QueryableDomainFieldConfig.comicReadlists.filter,
);

export const AllowedComicReadlistsSortSchema = z.enum(
	QueryableDomainFieldConfig.comicReadlists.sort,
);

export const getAllowedFilterFields = <TDomain extends QueryableDomain>(
	domain: TDomain,
): readonly QueryableFilterField<TDomain>[] =>
	QueryableDomainFieldConfig[domain].filter;

export const getAllowedSortFields = <TDomain extends QueryableDomain>(
	domain: TDomain,
): readonly QueryableSortField<TDomain>[] =>
	QueryableDomainFieldConfig[domain].sort;
