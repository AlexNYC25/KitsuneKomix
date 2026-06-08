import { eq, and, isNull, or } from "drizzle-orm";
import { getClient } from "../client.ts";
import { comicBookIngestionTable } from "../schemas/tables/comicBookIngestion.table.ts";

export type IngestionState =
  | "FILE_DETECTED"
  | "METADATA_EXTRACTION"
  | "METADATA_CANDIDATES_CREATED"
  | "METADATA_ENTITIES_RESOLVED"
  | "COMIC_LINKS_BUILT"
  | "COMIC_INGESTION_COMPLETED"
  | "FAILED";

export type ComicBookIngestionRecord = {
  id: number;
  comicBookId: number;
  metadata: string | null;
  state: IngestionState | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export class ComicBookIngestionModel {
  /**
   * Create a new ingestion record
   */
  static async create(comicBookId: number, state: IngestionState = "FILE_DETECTED") {
    const { db } = getClient();
    if (!db) {
      throw new Error("Database client is not initialized");
    }

    const [result] = await db
      .insert(comicBookIngestionTable)
      .values({
        comicBookId,
        state,
      })
      .returning();
    
    return result;
  }

  /**
   * Get pending jobs (jobs that need processing)
   * Returns jobs in order of creation
   */
  static async getPendingJobs(limit = 10): Promise<ComicBookIngestionRecord[]> {
    const { db } = getClient();
    if (!db) {
      throw new Error("Database client is not initialized");
    }

    const jobs = await db
      .select()
      .from(comicBookIngestionTable)
      .where(
        and(
          or(
            eq(comicBookIngestionTable.state, "FILE_DETECTED"),
            eq(comicBookIngestionTable.state, "METADATA_EXTRACTION"),
            eq(comicBookIngestionTable.state, "METADATA_CANDIDATES_CREATED"),
            eq(comicBookIngestionTable.state, "METADATA_ENTITIES_RESOLVED"),
            eq(comicBookIngestionTable.state, "COMIC_LINKS_BUILT")
          ),
          isNull(comicBookIngestionTable.errorMessage)
        )
      )
      .limit(limit)
      .orderBy(comicBookIngestionTable.createdAt);

    return jobs as ComicBookIngestionRecord[];
  }

  /**
   * Get a specific ingestion record by ID
   */
  static async getById(id: number): Promise<ComicBookIngestionRecord | undefined> {
    const { db } = getClient();
    if (!db) {
      throw new Error("Database client is not initialized");
    }

    const [result] = await db
      .select()
      .from(comicBookIngestionTable)
      .where(eq(comicBookIngestionTable.id, id));

    return result as ComicBookIngestionRecord | undefined;
  }

  /**
   * Get ingestion record by comic book ID
   */
  static async getByComicBookId(comicBookId: number): Promise<ComicBookIngestionRecord | undefined> {
    const { db } = getClient();
    if (!db) {
      throw new Error("Database client is not initialized");
    }

    const [result] = await db
      .select()
      .from(comicBookIngestionTable)
      .where(eq(comicBookIngestionTable.comicBookId, comicBookId));

    return result as ComicBookIngestionRecord | undefined;
  }

  /**
   * Update the state of an ingestion job
   */
  static async updateState(
    id: number,
    state: IngestionState,
    metadata?: Record<string, unknown>
  ) {
    const { db } = getClient();
    if (!db) {
      throw new Error("Database client is not initialized");
    }

    const updateData: Partial<{
      state: IngestionState;
      metadata: string;
      updatedAt: string;
    }> = {
      state,
      updatedAt: new Date().toISOString(),
    };

    if (metadata) {
      updateData.metadata = JSON.stringify(metadata);
    }

    const [result] = await db
      .update(comicBookIngestionTable)
      .set(updateData)
      .where(eq(comicBookIngestionTable.id, id))
      .returning();

    return result;
  }

  /**
   * Mark a job as failed with error message
   */
  static async markAsFailed(id: number, errorMessage: string) {
    const { db } = getClient();
    if (!db) {
      throw new Error("Database client is not initialized");
    }

    const [result] = await db
      .update(comicBookIngestionTable)
      .set({
        state: "FAILED",
        errorMessage,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(comicBookIngestionTable.id, id))
      .returning();

    return result;
  }

  /**
   * Delete an ingestion record
   */
  static async delete(id: number) {
    const { db } = getClient();
    if (!db) {
      throw new Error("Database client is not initialized");
    }

    await db
      .delete(comicBookIngestionTable)
      .where(eq(comicBookIngestionTable.id, id));
  }

  /**
   * Get metadata for a job (parsed from JSON)
   */
  static getMetadata(record: ComicBookIngestionRecord): Record<string, unknown> | null {
    if (!record.metadata) return null;
    try {
      return JSON.parse(record.metadata);
    } catch {
      return null;
    }
  }
}
