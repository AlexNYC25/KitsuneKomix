import { eq, and } from "drizzle-orm";
import { getClient } from "../client.ts";
import { comicMetadataCandidatesTable } from "../schemas/tables/comicMetadataCandidates.table.ts";

export type MetadataCandidateType =
  | "title"
  | "series"
  | "publisher"
  | "writer"
  | "artist"
  | "penciler"
  | "inker"
  | "colorist"
  | "letterer"
  | "cover_artist"
  | "editor"
  | "character"
  | "team"
  | "location"
  | "story_arc";

export type MetadataCandidateStatus = "pending" | "accepted" | "rejected";

export type ComicMetadataCandidateRecord = {
  id: number;
  comicBookId: number;
  type: string;
  value: string;
  normalizedValue: string;
  status: MetadataCandidateStatus;
  resolvedId: number | null;
  createdAt: string;
  updatedAt: string;
};

export class ComicMetadataCandidatesModel {
  /**
   * Create a new metadata candidate
   */
  static async create(
    comicBookId: number,
    type: MetadataCandidateType,
    value: string
  ) {
    const { db } = getClient();

    if (!db) {
      throw new Error("Database client is not initialized");
    }

    const normalizedValue = value.toLowerCase().trim();

    const [result] = await db
      .insert(comicMetadataCandidatesTable)
      .values({
        comicBookId,
        type,
        value,
        normalizedValue,
        status: "pending",
      })
      .returning();

    return result;
  }

  /**
   * Bulk create metadata candidates
   */
  static async createMany(
    candidates: Array<{
      comicBookId: number;
      type: MetadataCandidateType;
      value: string;
    }>
  ) {
    if (candidates.length === 0) return [];

    const { db } = getClient();

    if (!db) {
      throw new Error("Database client is not initialized");
    }
    
    const values = candidates.map((c) => ({
      comicBookId: c.comicBookId,
      type: c.type,
      value: c.value,
      normalizedValue: c.value.toLowerCase().trim(),
      status: "pending" as const,
    }));

    const results = await db
      .insert(comicMetadataCandidatesTable)
      .values(values)
      .returning();

    return results;
  }

  /**
   * Get all candidates for a comic book
   */
  static async getByComicBookId(comicBookId: number): Promise<ComicMetadataCandidateRecord[]> {
    const { db } = getClient();

    if (!db) {
      throw new Error("Database client is not initialized");
    }

    const candidates = await db
      .select()
      .from(comicMetadataCandidatesTable)
      .where(eq(comicMetadataCandidatesTable.comicBookId, comicBookId));

    return candidates as ComicMetadataCandidateRecord[];
  }

  /**
   * Get pending candidates for a comic book
   */
  static async getPendingByComicBookId(
    comicBookId: number
  ): Promise<ComicMetadataCandidateRecord[]> {
    const { db } = getClient();

    if (!db) {
      throw new Error("Database client is not initialized");
    }

    const candidates = await db
      .select()
      .from(comicMetadataCandidatesTable)
      .where(
        and(
          eq(comicMetadataCandidatesTable.comicBookId, comicBookId),
          eq(comicMetadataCandidatesTable.status, "pending")
        )
      );

    return candidates as ComicMetadataCandidateRecord[];
  }

  /**
   * Update candidate status
   */
  static async updateStatus(
    id: number,
    status: MetadataCandidateStatus,
    resolvedId?: number
  ) {
    const { db } = getClient();

    if (!db) {
      throw new Error("Database client is not initialized");
    }

    const updateData: Partial<{
      status: MetadataCandidateStatus;
      resolvedId: number;
      updatedAt: string;
    }> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (resolvedId !== undefined) {
      updateData.resolvedId = resolvedId;
    }

    const [result] = await db
      .update(comicMetadataCandidatesTable)
      .set(updateData)
      .where(eq(comicMetadataCandidatesTable.id, id))
      .returning();

    return result;
  }

  /**
   * Delete candidates for a comic book
   */
  static async deleteByComicBookId(comicBookId: number) {
    const { db } = getClient();
    if (!db) {
      throw new Error("Database client is not initialized");
    }

    await db
      .delete(comicMetadataCandidatesTable)
      .where(eq(comicMetadataCandidatesTable.comicBookId, comicBookId));
  }
}
