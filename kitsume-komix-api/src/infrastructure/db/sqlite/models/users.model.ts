import { eq } from "drizzle-orm";

import { getClient } from "../client.ts";
import { usersTable } from "../schema.ts";

import type { NewUser, User } from "#types/index.ts";

/**
 * Creates a new user in the database
 * @param userData The user data including username, email, and password hash
 * @returns The ID of the newly created user
 */
export const createUser = async (userData: NewUser): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(usersTable)
      .values(userData)
      .returning({ id: usersTable.id });

    return result[0].id;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Retrieves a user by their ID
 * @param id The user ID
 * @returns The User object, or null if not found
 */
export const getUserById = async (id: number): Promise<User | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: User[] = await db
      .select()
      .from(usersTable)
      .where(
        eq(usersTable.id, id),
      );

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

/**
 * Retrieves a user by their email address
 * @param email The email address of the user
 * @returns The User object, or null if not found
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: User[] = await db
      .select()
      .from(usersTable)
      .where(
        eq(usersTable.email, email),
      );

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
};

/**
 * Retrieves a user by their username
 * @param username The username of the user
 * @returns The User object, or null if not found
 */
export const getUserByUsername = async (
  username: string,
): Promise<User | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: User[] = await db
      .select()
      .from(usersTable)
      .where(
        eq(usersTable.username, username),
      );

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    throw error;
  }
};

/**
 * Retrieves all users from the database
 * @returns An array of all User objects
 */
export const getAllUsers = async (): Promise<User[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: User[] = await db
      .select()
      .from(usersTable);

    return result;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

/**
 * Updates an existing user with new data
 * @param id The ID of the user to update
 * @param updates Partial user data to update (username, email, password, name fields, admin status)
 * @returns True if the update was successful, false otherwise
 */
export const updateUser = async (
  id: number,
  updates: Partial<{
    username: string;
    email: string;
    password_hash: string;
    first_name?: string | null;
    last_name?: string | null;
    admin: boolean;
  }>,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.password_hash !== undefined) {
      updateData.password_hash = updates.password_hash;
    }
    if (updates.first_name !== undefined) {
      updateData.first_name = updates.first_name;
    }
    if (updates.last_name !== undefined) {
      updateData.last_name = updates.last_name;
    }
    if (updates.admin !== undefined) updateData.admin = updates.admin ? 1 : 0;

    const result: { id: number }[] = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

/**
 * Deletes a user by ID.
 * @param id The ID of the user to delete.
 * @returns True if the user was deleted, false otherwise.
 */
export const deleteUser = async (id: number): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: {
      id: number;
    }[] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
