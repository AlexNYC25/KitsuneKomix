import { hashPassword } from "../utilities/hash.ts";
import { UserRegistrationInput } from "../types/index.ts";
import { createUser, getUserByEmail } from "../db/sqlite/models/users.model.ts";

export async function createUserService(
  user: UserRegistrationInput,
): Promise<number> {
  let existingUser;

  try {
    // Check if user with the same email already exists
    existingUser = await getUserByEmail(user.email);
  } catch (error) {
    console.error("Error checking existing user:", error);
    throw new Error("Internal server error");
  }

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash the user's password before storing it
  const hashedPassword = await hashPassword(user.password);

  // Insert new user into the database
  const newUserId = await createUser({
    username: user.username,
    email: user.email,
    password_hash: hashedPassword,
    first_name: user.firstName ?? null,
    last_name: user.lastName ?? null,
    admin: 0, // Default to non-admin
  });

  return newUserId;
}
