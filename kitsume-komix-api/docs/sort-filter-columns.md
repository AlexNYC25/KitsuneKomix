# Sort/Filter Columns by Domain

This document explains:

- How to fetch the allowed `filter` and `sort` values for a specific domain
- How to add new allowed values in the correct place

## Single Source of Truth

The canonical definition is:

- `src/shared/zod/schemas/data/queryableColumns.schema.ts`

Specifically, update and read from:

- `QueryableDomainFieldConfig`

All of the following derive from this config:

- Zod enums for request validation (`AllowedComicFiltersSchema`, `AllowedComicSortSchema`, etc.)
- Runtime helpers (`getAllowedFilterFields`, `getAllowedSortFields`)
- TypeScript types (`ComicFilterField`, `ComicSortField`, etc.)
- Infrastructure queryable map (`QueryableColumns`)

## Supported Domains

Current domains are:

- `comics`
- `comicSeries`
- `comicReadlists`

## Fetch Allowed Values for a Domain

Use the helper functions from the schema module.

```ts
import {
	getAllowedFilterFields,
	getAllowedSortFields,
	type QueryableDomain,
} from "#zod/schemas/data/queryableColumns.schema.ts";

const domain: QueryableDomain = "comics";

const allowedFilters = getAllowedFilterFields(domain);
const allowedSorts = getAllowedSortFields(domain);

console.log({ domain, allowedFilters, allowedSorts });
```

Examples:

```ts
getAllowedFilterFields("comicSeries");
getAllowedSortFields("comicReadlists");
```

## Validate User Input Against Allowed Values

If you need validation directly, use domain-specific enums:

```ts
import {
	AllowedComicFiltersSchema,
	AllowedComicSortSchema,
	AllowedComicSeriesFiltersSchema,
	AllowedComicSeriesSortSchema,
} from "#zod/schemas/data/queryableColumns.schema.ts";

AllowedComicFiltersSchema.parse("title");
AllowedComicSortSchema.parse("createdAt");

AllowedComicSeriesFiltersSchema.parse("libraryId");
AllowedComicSeriesSortSchema.parse("publicationDate");
```

Request-level schemas in `src/shared/zod/schemas/request.schema.ts` already consume these enums.

## Add Additional Filter/Sort Values

When adding a new field, do this in order:

1. Update `QueryableDomainFieldConfig` in `src/shared/zod/schemas/data/queryableColumns.schema.ts`.
2. Add the field to the domain's `filter` array, `sort` array, or both.
3. Ensure your data/model layer supports using that field in queries.
4. If needed, add route/service logic to handle special semantics (for example custom parsing).
5. Run type checks/tests.

Example: add `issueCount` as a sortable field for `comicSeries`.

```ts
comicSeries: {
	filter: [
		// existing fields...
	],
	sort: [
		"id",
		"name",
		"createdAt",
		"updatedAt",
		"publicationDate",
		"issueCount", // new value
	],
}
```

After this update:

- `AllowedComicSeriesSortSchema` will include `issueCount`
- `getAllowedSortFields("comicSeries")` will include `issueCount`
- `ComicSeriesSortField` type will include `issueCount`
- `QueryableColumns.comicSeries.sort` will include `issueCount`

## Practical Notes

- Do not manually edit multiple places for the same allowed field list.
- Prefer deriving types/enums/helpers from `QueryableDomainFieldConfig`.
- If a field is allowed by config but fails at runtime, the query/model layer likely needs support for that field.
