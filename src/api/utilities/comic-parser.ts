
export type ComicFileDetails = {
	series: string;
	issue: string;
	volume?: string;
	count?: string;
	year?: string;
}

export type ComicSeriesDetails = {
	series: string;
	volume?: string;
	count?: string;
	year?: string;
};

export const getComicFileRawDetails = (filePath: string): ComicFileDetails => {
	const path = filePath.replace(/\\/g, '/');
	const parts = path.split('/');
	const fileName = parts[parts.length - 1];
	const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");

	// Enhanced regex to capture series, issue number, volume, count, and year
	// - Example formats:
	//   "Amazing Spider-Man v1 001 (2020)"
	//   "Batman 040 (2018)"
	//   "Batgirl 003 (2025) (Digital) (Pyrate-DCP)"
	//
	// Strategy: Extract series and issue first, then find year in any parentheses
	// Series name: characters until we hit a pattern that looks like an issue number
	// Volume: 'v' followed by digits (optional)
	// Issue: 1-3 digit number that may have leading zeros
	// Year: 4 digit number in any parentheses
	// Count: "of X" pattern in parentheses
	
	// First, extract potential year from any parentheses containing 4 digits
	const yearMatch = nameWithoutExtension.match(/\((\d{4})\)/);
	const year = yearMatch ? yearMatch[1] : "";
	
	// Extract potential count from "of X" pattern
	const countMatch = nameWithoutExtension.match(/\(of\s+(\d+)\)/i);
	const count = countMatch ? countMatch[1] : "";
	
	// Now parse the main structure (series, volume, issue)
	// Remove year and count parentheses to simplify parsing
	let cleanName = nameWithoutExtension;
	if (yearMatch) {
		cleanName = cleanName.replace(/\s*\(\d{4}\)/, '');
	}
	if (countMatch) {
		cleanName = cleanName.replace(/\s*\(of\s+\d+\)/i, '');
	}
	// Remove any remaining parenthetical content (like "(Digital)", "(Pyrate-DCP)")
	cleanName = cleanName.replace(/\s*\([^)]*\)/g, '').trim();
	
	// Parse series, volume, and issue from the cleaned name
	const mainRegex = /^(.*?)(?:\s+v(\d+))?(?:\s+0*(\d{1,3}))?\s*$/i;
	const match = cleanName.match(mainRegex);

	if (match) {
		return {
			series: match[1]?.trim() || "",
			volume: match[2]?.trim() || "",
			issue: match[3]?.trim() || "",
			count: count,
			year: year,
		};
	} else {
		return {
			series: cleanName || nameWithoutExtension,
			issue: "",
			volume: "",
			count: count,
			year: year,
		};
	}
};

export const getComicSeriesRawDetails = (folderPath: string): ComicSeriesDetails => {
	const path = folderPath.replace(/\\/g, '/');
	const parts = path.split('/');
	const folderName = parts[parts.length - 1];

	// Enhanced regex to capture series, volume, count, and year from folder names
	// - Example formats:
	//   "Amazing Spider-Man v1 (2020)"
	//   "Batgirl (2025)"
	//   "Batman v2 (of 12) (2018)"
	//
	// Strategy: Similar to file parsing but without issue numbers
	// Extract year from any parentheses containing 4 digits
	// Extract count from "of X" pattern
	// Parse remaining content for series and volume
	
	// First, extract potential year from any parentheses containing 4 digits
	const yearMatch = folderName.match(/\((\d{4})\)/);
	const year = yearMatch ? yearMatch[1] : "";
	
	// Extract potential count from "of X" pattern
	const countMatch = folderName.match(/\(of\s+(\d+)\)/i);
	const count = countMatch ? countMatch[1] : "";
	
	// Clean the folder name by removing year and count parentheses
	let cleanName = folderName;
	if (yearMatch) {
		cleanName = cleanName.replace(/\s*\(\d{4}\)/, '');
	}
	if (countMatch) {
		cleanName = cleanName.replace(/\s*\(of\s+\d+\)/i, '');
	}
	// Remove any remaining parenthetical content
	cleanName = cleanName.replace(/\s*\([^)]*\)/g, '').trim();
	
	// Parse series and volume from the cleaned name
	const mainRegex = /^(.*?)(?:\s+v(\d+))?\s*$/i;
	const match = cleanName.match(mainRegex);

	if (match) {
		return {
			series: match[1]?.trim() || "",
			volume: match[2]?.trim() || "",
			count: count,
			year: year,
		};
	} else {
		return {
			series: cleanName || folderName,
			volume: "",
			count: count,
			year: year,
		};
	}
};
