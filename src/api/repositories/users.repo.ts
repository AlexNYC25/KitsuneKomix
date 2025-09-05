import { getDatabase } from "../config/db/sqliteConnection.ts";
import { NewUser, UserRow } from "../types/user.type.ts";

function mapRowToUser(row: Record<string, unknown>): UserRow {
  return {
    id: row.id as number,
    username: row.username as string,
    email: row.email as string,
    password_hash: row.password_hash as string,
    first_name: row.first_name as string | null,
    last_name: row.last_name as string | null,
  };
}

export const createUser = (userData: NewUser): number => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash, first_name, last_name)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    userData.username,
    userData.email,
    userData.passwordHash,
    userData.firstName ?? null,
    userData.lastName ?? null,
  );

  const id = db.lastInsertRowId;
  return id;
};

export const getUserById = (id: number): UserRow | undefined => {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  const user = stmt.get(id) as Record<string, unknown> | undefined;
  return user ? mapRowToUser(user) : undefined;
};

export const getUserByEmail = (email: string): UserRow | undefined => {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  const row = stmt.get(email) as Record<string, unknown> | undefined;
  return row ? mapRowToUser(row) : undefined;
};
