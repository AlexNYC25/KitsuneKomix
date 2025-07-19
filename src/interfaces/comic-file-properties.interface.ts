
/**
 * Interface representing the properties of a comic file.
 * This interface is used to define the structure of comic file metadata we get from parsing the file name
 * 
 * @interface ComicFileProperties
 * @property {string} seriesName - The name of the comic series.
 * @property {string} issueNumber - The issue number of the comic.
 * @property {string} volumeNumber - The volume number of the comic.
 * @property {string} year - The year of publication.
 * @property {string[]} tags - An array of tags associated with the comic.
 */
export interface ComicFileProperties {
  seriesName: string;
  issueNumber: string;
  volumeNumber: string;
  year: string;
  tags: string[];
}