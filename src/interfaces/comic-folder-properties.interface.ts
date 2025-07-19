/**
 * ComicFolderProperties Interface
 * This interface defines the properties of a comic folder, including series name,
 * year, volume, and tags from the parsed folder name
 * 
 * @interface ComicFolderProperties
 * @property {string} seriesName - The name of the comic series.
 * @property {string} seriesYear - The year of the comic series.
 * @property {string} seriesVolume - The volume of the comic series.
 * @property {string[]} seriesTags - An array of tags associated with the comic series.
 */
export interface ComicFolderProperties {
  seriesName: string;
  seriesYear: string;
  seriesVolume: string;
  seriesTags: string[];
}