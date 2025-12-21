import { getUserByEmail } from "#sqlite/models/users.model.ts";

import { verifyPassword } from "#utilities/hash.ts";
import { User } from "#types/index.ts";

/**
 * Authenticates a user by email and password.
 * @param email User's email address
 * @param password User's password
 * @returns The authenticated user's details if successful
 * @throws Error if authentication fails
 */
export const authenticateUser = async (
  email: string, 
  password: string
): Promise<{ id: number; email: string; admin: boolean }> => {
  const user: User | null = await getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  // Verify the password (you should hash and compare in a real app)
  if (!(await verifyPassword(user.passwordHash, password))) {
    throw new Error("Invalid password");
  }

  return { id: user.id, email: user.email, admin: user.admin === 1 };
};
