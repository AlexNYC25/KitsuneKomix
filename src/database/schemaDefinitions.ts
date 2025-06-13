export const createComicsTable = `
  CREATE TABLE IF NOT EXISTS comics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filepath TEXT NOT NULL,
    added_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

