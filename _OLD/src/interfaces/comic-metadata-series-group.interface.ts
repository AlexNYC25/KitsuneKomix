
/**
 * Interface representing the relationship between comic metadata and series groups.
 * This interface is used to define the structure of the comic_metadata_series_groups table in the database
 * 
 * @interface ComicMetadataSeriesGroup
 * @property {number | null} id - The unique identifier for the comic metadata series group.
 * @property {number} metadata_id - The ID of the comic metadata this series group is associated with.
 * @property {number} series_group_id - The ID of the comic series group this metadata is associated with.
 */
export interface ComicMetadataSeriesGroup {
  id: number | null;
  metadata_id: number;
  series_group_id: number;
}
