
export type StandardizedComicMetadataPage = {
	image: string;
	type: string;
	doublePage?: boolean;
	size?: number;
	width?: number;
	height?: number;
}

export type StandardizedComicMetadataReadingDirection = "LeftToRight" | "RightToLeft" | "TopToBottom" | "BottomToTop";

export interface StandardizedComicMetadata {
	title?: string;
	series: string;
	issueNumber: string;
	volume?: string;
	count: number;
	alternateSeries?: string;
	alternateNumber?: string;
	alternateCount?: string;
	pageCount: number;
	summary?: string;
	notes?: string;
	year?: number;
	month?: number;
	day?: number;
	scanInfo?: string;
	language?: string;
	format?: string;
	blackAndWhite?: boolean;
	manga?: boolean;
	readingDirection?: StandardizedComicMetadataReadingDirection;
	review?: string;

	writers?: string[];
	artists?: string[];
	inkers?: string[];
	colorists?: string[];
	letterers?: string[];
	editors?: string[];
	coverArtists?: string[];
	publisher?: string[];
	imprint?: string[];
	genre?: string[];
	web?: string[];
	characters?: string[];
	teams?: string[];
	mainCharacterTeam?: string;
	locations?: string[];
	storyArc?: string[];
	seriesGroup?: string[];


	ageRating?: string;
	communityRating?: number;

	pages?: StandardizedComicMetadataPage[];
}	