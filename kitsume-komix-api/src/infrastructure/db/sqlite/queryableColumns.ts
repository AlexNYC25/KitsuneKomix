import {
  QueryableDomainFieldConfig,
  type QueryableDomain,
} from "#zod/schemas/data/queryableColumns.schema.ts";

const toFieldMap = <const TFields extends readonly string[]>(fields: TFields) => {
  const mapped = Object.fromEntries(fields.map((field) => [field, field]));
  return mapped as {
    readonly [K in TFields[number]]: K;
  };
};

const buildDomainConfig = <TDomain extends QueryableDomain>(domain: TDomain) => ({
  filter: toFieldMap(QueryableDomainFieldConfig[domain].filter),
  sort: toFieldMap(QueryableDomainFieldConfig[domain].sort),
});

export const QueryableColumns = {
  comics: buildDomainConfig("comics"),
  comicSeries: buildDomainConfig("comicSeries"),
  comicReadlists: buildDomainConfig("comicReadlists"),
} as const;
