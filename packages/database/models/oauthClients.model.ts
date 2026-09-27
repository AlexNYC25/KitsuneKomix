import { eq } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";
import { oauthClientsTable } from "../schemas/index.ts";

import type { NewOauthClient, OauthClient, DrizzleType } from "../shared/types/index.ts";

/**
 * Creates a new OAuth client in the database
 * @param clientData The client data including the public client_id and name
 * @returns The ID of the newly created client
 */
export const createOauthClient = async (
  clientData: NewOauthClient,
): Promise<number> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(oauthClientsTable)
      .values(clientData)
      .returning({ id: oauthClientsTable.id });

    if (!result[0]) {
      throw new Error("No record returned when inserting OAuth client.");
    }

    return result[0].id;
  } catch (error) {
    dbLogger.error("Error creating OAuth client:" + error);
    throw error;
  }
};

/**
 * Retrieves an OAuth client by its public client_id
 * @param clientId The public client identifier
 * @returns The OauthClient object, or null if not found
 */
export const getOauthClientByClientId = async (
  clientId: string,
): Promise<OauthClient | null> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: OauthClient[] = await db
      .select()
      .from(oauthClientsTable)
      .where(eq(oauthClientsTable.clientId, clientId))
      .limit(1);

    return result[0] ?? null;
  } catch (error) {
    dbLogger.error("Error fetching OAuth client by client_id:" + error);
    throw error;
  }
};

/**
 * Retrieves an OAuth client by its internal ID
 * @param id The client ID
 * @returns The OauthClient object, or null if not found
 */
export const getOauthClientById = async (
  id: number,
): Promise<OauthClient | null> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: OauthClient[] = await db
      .select()
      .from(oauthClientsTable)
      .where(eq(oauthClientsTable.id, id))
      .limit(1);

    return result[0] ?? null;
  } catch (error) {
    dbLogger.error("Error fetching OAuth client by ID:" + error);
    throw error;
  }
};

/**
 * Retrieves all OAuth clients from the database
 * @returns An array of all OauthClient objects
 */
export const getAllOauthClients = async (): Promise<OauthClient[]> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    return await db.select().from(oauthClientsTable);
  } catch (error) {
    dbLogger.error("Error fetching all OAuth clients:" + error);
    throw error;
  }
};

/**
 * Updates the status of an OAuth client (active | disabled)
 * @param id The client ID
 * @param status The new client status
 * @returns True if the client was updated, false otherwise
 */
export const setOauthClientStatus = async (
  id: number,
  status: string,
): Promise<boolean> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .update(oauthClientsTable)
      .set({ status })
      .where(eq(oauthClientsTable.id, id))
      .returning({ id: oauthClientsTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error updating OAuth client status:" + error);
    throw error;
  }
};