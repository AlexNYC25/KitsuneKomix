import { getClient } from "../client.ts";
import { usersTable } from "../schema.ts";
import type { NewUser, User } from "../../../types/index.ts";
import { eq } from "drizzle-orm";

export const createUser = async (userData: NewUser): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(usersTable)
      .values(userData)
      .returning({ id: usersTable.id });

    return result[0].id;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(usersTable).where(
      eq(usersTable.id, id),
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(usersTable).where(
      eq(usersTable.email, email),
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
};

export const getUserByUsername = async (
  username: string,
): Promise<User | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(usersTable).where(
      eq(usersTable.username, username),
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(usersTable);
    return result;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

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

    const result = await db
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

export const deleteUser = async (id: number): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
