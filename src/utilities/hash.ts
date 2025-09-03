
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

/**
 * Hash a plaintext password using bcrypt.
 * @param plain - the user-provided password
 * @returns hashed password string (including salt & cost)
 */
export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 * @param hash - stored hash from the DB
 * @param plain - user-provided password to check
 */
export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}
