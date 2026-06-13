import { eq, and } from "drizzle-orm";
import { getClient } from "../client.ts";
import { comicMetadataCandidatesTable } from "../schemas/tables/comicMetadataCandidates.table.ts";

import type { MetadataCandidateType, MetadataCandidateStatus, ComicMetadataCandidate, NewComicMetadataCandidate } from "#types/index.ts";
import { dbLogger } from "#root/src/infrastructure/logger/loggers.ts";

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
  static async getByComicBookId(comicBookId: number): Promise<ComicMetadataCandidate[]> {
    const { db } = getClient();

    if (!db) {
      throw new Error("Database client is not initialized");
    }

    const candidates = await db
      .select()
      .from(comicMetadataCandidatesTable)
      .where(eq(comicMetadataCandidatesTable.comicBookId, comicBookId));

    return candidates as ComicMetadataCandidate[];
  }

  /**
   * Get pending candidates for a comic book
   */
  static async getPendingByComicBookId(
    comicBookId: number
  ): Promise<ComicMetadataCandidate[]> {
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

    return candidates as ComicMetadataCandidate[];
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

/**
 * The bulk insertion function for comic metadata candidates. This is used to insert multiple candidates at once, such as after metadata extraction from a comic book file.
 * 
 * @param candidates The array of new comic metadata candidates to insert
 * @returns The array of insert records of the type ComicMetadataCandidate corresponding to the 
 */
export const insertComicMetadataCandidates = async (
  candidates: NewComicMetadataCandidate[]
): Promise<ComicMetadataCandidate[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertedCandidates: ComicMetadataCandidate[] = await db
      .insert(comicMetadataCandidatesTable)
      .values(
        candidates.map((candidate) => ({
          comicBookId: candidate.comicBookId,
          type: candidate.type,
          value: candidate.value,
          normalizedValue: candidate.value.toLowerCase().trim(),
          status: "pending" as const,
        }))
      )
      .returning();

    return insertedCandidates;
  } catch (error) {
    dbLogger.error(`Error inserting comic metadata candidates: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}