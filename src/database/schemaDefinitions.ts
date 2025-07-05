
//
// Internal Database Schema Definitions
//

export const createAppTasksTable = `
  CREATE TABLE IF NOT EXISTS app_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_name TEXT NOT NULL,
    status TEXT NOT NULL,
    initiated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    interval INTEGER NOT NULL DEFAULT 0
    );
  `;
  
export const createAppSettingsTable = `
  CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_name TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

export const createMigrationsTable = `
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;

//
// Comic Book Database Schema Definitions
//

export const createComicBookStoryArcsTable = `
  CREATE TABLE IF NOT EXISTS comic_story_arcs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    description TEXT
  );
`;

export const createComicMetadataTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    series TEXT,
    number TEXT,
    count INTEGER,
    volume TEXT,
    alternate_series TEXT,
    alternate_number TEXT,
    alternate_volume TEXT,
    summary TEXT,
    notes TEXT,
    year INTEGER,
    month INTEGER,
    day INTEGER,
    website TEXT,
    page_count INTEGER,
    language TEXT,
    format TEXT,
    black_and_white BOOLEAN DEFAULT 0,
    manga BOOLEAN DEFAULT 0,
    scan_info TEXT,
    story_arc_id INTEGER,
    community_rating REAL,
    main_character TEXT,
    review TEXT,
    gtin TEXT,
    FOREIGN KEY (story_arc_id) REFERENCES comic_story_arcs(id)
  );
`;

// NOTE: Work in progress, some fields may note end up being used
export const createComicSeriesTable = `
  CREATE TABLE IF NOT EXISTS comic_series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    folder_path TEXT NOT NULL UNIQUE,
    description TEXT,
    publisher TEXT,
    start_year INTEGER,
    end_year INTEGER,
    total_issues INTEGER
  );
`;

export const createComicsTable = `
  CREATE TABLE IF NOT EXISTS comic_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    metadata_id INTEGER,
    series_id INTEGER,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id)
    FOREIGN KEY (series_id) REFERENCES comic_series(id)
  );
`;

export const createComicBookSeriesGroupsTable = `
  CREATE TABLE IF NOT EXISTS comic_series_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;

export const createComicBookPencillersTable = `
  CREATE TABLE IF NOT EXISTS comic_pencillers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;

export const createComicBookWritersTable = `
  CREATE TABLE IF NOT EXISTS comic_writers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;

export const createComicBookInkersTable = `
  CREATE TABLE IF NOT EXISTS comic_inkers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;

export const createComicBookColoristsTable = `
  CREATE TABLE IF NOT EXISTS comic_colorists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;
export const createComicBookLetterersTable = `
  CREATE TABLE IF NOT EXISTS comic_letterers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;

export const createComicBookCoverArtistsTable = `
  CREATE TABLE IF NOT EXISTS comic_cover_artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;

export const createComicBookEditorsTable = `
  CREATE TABLE IF NOT EXISTS comic_editors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
`;

export const createComicBookPublishersTable = `
  CREATE TABLE IF NOT EXISTS comic_publishers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
`;

export const createComicBookImprintsTable = `
  CREATE TABLE IF NOT EXISTS comic_imprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;

export const createComicBookGenresTable = `
  CREATE TABLE IF NOT EXISTS comic_genre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;

export const createComicBookTranslatorsTable = `
  CREATE TABLE IF NOT EXISTS comic_translators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;

export const createComicBookTagsTable = `
  CREATE TABLE IF NOT EXISTS comic_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;

export const createComicBookCharactersTable = `
  CREATE TABLE IF NOT EXISTS comic_characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
  );
`;

export const createComicBookLocationsTable = `
  CREATE TABLE IF NOT EXISTS comic_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
  );
`;

export const createComicBookTeamsTable = `
  CREATE TABLE IF NOT EXISTS comic_teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
  );
`;
export const createComicBookAgeRatingsTable = `
  CREATE TABLE IF NOT EXISTS comic_age_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;

export const createComicBookPageTypesTable = `
  CREATE TABLE IF NOT EXISTS comic_page_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`;

export const createComicBookPagesTable = `
  CREATE TABLE IF NOT EXISTS comic_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    page_number INTEGER NOT NULL,
    double_page BOOLEAN DEFAULT 0,
    image_size INTEGER NOT NULL,
    image_path TEXT NOT NULL,
    key_image BOOLEAN DEFAULT 0,
    image_width INTEGER NOT NULL,
    image_height INTEGER NOT NULL,
    image_hash TEXT NOT NULL,
    page_type_id INTEGER,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id)
    FOREIGN KEY (page_type_id) REFERENCES comic_page_types(id)
  );
`;


export const createComicBookMetadataPencillersTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_pencillers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    penciller_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (penciller_id) REFERENCES comic_pencillers(id)
  );
`;

export const createComicBookMetadataWritersTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_writers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    writer_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (writer_id) REFERENCES comic_writers(id)
  );
`;

export const createComicBookMetadataInkersTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_inkers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    inker_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (inker_id) REFERENCES comic_inkers(id)
  );
`;

export const createComicBookMetadataColoristsTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_colorists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    colorist_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (colorist_id) REFERENCES comic_colorists(id)
  );
`;

export const createComicBookMetadataLetterersTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_letterers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    letterer_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (letterer_id) REFERENCES comic_letterers(id)
  );
`;

export const createComicBookMetadataCoverArtistsTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_cover_artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    cover_artist_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (cover_artist_id) REFERENCES comic_cover_artists(id)
  );
`;

export const createComicBookMetadataEditorsTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_editors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    editor_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (editor_id) REFERENCES comic_editors(id)
  );
`;

export const createComicBookMetadataTranslatorsTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_translators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    translator_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (translator_id) REFERENCES comic_translators(id)
  );
`;

export const createComicBookMetadataPublishersTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_publishers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    publisher_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (publisher_id) REFERENCES comic_publishers(id)
  );
`;

export const createComicBookMetadataImprintsTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_imprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    imprint_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (imprint_id) REFERENCES comic_imprints(id)
  );
`;

export const createComicBookMetadataGenresTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (genre_id) REFERENCES comic_genre(id)
  );
`;

export const createComicBookMetadataTagsTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (tag_id) REFERENCES comic_tags(id)
  );
`;

export const createComicBookMetadataCharactersTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (character_id) REFERENCES comic_characters(id)
  );
`;

export const createComicBookMetadataLocationsTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (location_id) REFERENCES comic_locations(id)
  );
`;

export const createComicBookMetadataTeamsTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (team_id) REFERENCES comic_teams(id)
  );
`;

export const createComicBookMetadataStoryArcsTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_story_arcs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    story_arc_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (story_arc_id) REFERENCES comic_story_arcs(id)
  );
`;

export const createComicBookMetadataSeriesGroupsTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_series_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    series_group_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (series_group_id) REFERENCES comic_series_groups(id)
  );
`;

export const createComicBookMetadataAgeRatingsTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_age_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    age_rating_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (age_rating_id) REFERENCES comic_age_ratings(id)
  );
`;

export const createComicBookMetadataPagesTable = `
  CREATE TABLE IF NOT EXISTS comic_metadata_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metadata_id INTEGER NOT NULL,
    page_id INTEGER NOT NULL,
    FOREIGN KEY (metadata_id) REFERENCES comic_metadata(id),
    FOREIGN KEY (page_id) REFERENCES comic_pages(id)
  );
`;

