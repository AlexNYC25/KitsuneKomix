
/**
 * Splits a property string into an array of individual properties.
 * Handles both single properties and comma-separated lists of properties.
 * @param property - A string representing a property or a list of properties separated by commas.
 * @returns An array of trimmed property strings.
 */
export const splitProperty = (property: string): string[] => {
	const rawTrimmed = property.trim()

	// if there’s no comma but a non-empty string, treat it as one group
	const propertiesSplit = rawTrimmed
		? (rawTrimmed.includes(",")
			? rawTrimmed.split(",")
				.map((g: string) => g.trim())
				.filter((g: string) => g.length > 0)
			: [rawTrimmed])
		: []

	if (propertiesSplit.length === 0) {
		return [];
	}

	return propertiesSplit;
}