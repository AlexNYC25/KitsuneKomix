import { getClient } from "../client.ts";
import { comicCoverArtistsTable, comicBookCoverArtistsTable} from "../schema.ts";
import { eq } from "drizzle-orm";

export const insertComicCoverArtist = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicCoverArtistsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicCoverArtistsTable.id });

    // If result is empty, it means the cover artist already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing cover artist by name (which should be unique)
      const existingCoverArtist = await db
        .select({ id: comicCoverArtistsTable.id })
        .from(comicCoverArtistsTable)
        .where(eq(comicCoverArtistsTable.name, name));
      
      if (existingCoverArtist.length > 0) {
        console.log(`Comic cover artist already exists with name: ${name}, returning existing ID: ${existingCoverArtist[0].id}`);
        return existingCoverArtist[0].id;
      }
      
      throw new Error(`Failed to insert comic cover artist and could not find existing cover artist. Name: ${name}`);
    }
    
    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic cover artist:", error);
    throw error;
  }
};

export const linkCoverArtistToComicBook = async (coverArtistId: number, comicBookId: number): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookCoverArtistsTable)
      .values({ comic_cover_artist_id: coverArtistId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking cover artist to comic book:", error);
    throw error;
  }
};