
/**
 * Lookup mapping user-friendly sort categories to their corresponding database fields.
 * This is used to translate sort options from the UI into the appropriate field names for API requests.
 * For example, "latest" maps to "createdAt" in the database, so when a user selects "latest" sorting,
 * the API request will use "createdAt" as the sort parameter.
 */
export const mapForCategoryToDbField: Record<string, string> = {
	"latest": "createdAt",
	"updated": "updatedAt",
	"name": "name",
	"publicationDate": "publicationDate",
};