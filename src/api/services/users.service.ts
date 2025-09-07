import { hashPassword } from "../utilities/hash.ts";
import { NewUser, UserRegistrationInput } from "../types/user.type.ts";
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
    ...user,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    passwordHash: hashedPassword,
  } as NewUser);

  return newUserId;
}
