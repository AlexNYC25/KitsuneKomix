import { hashPassword } from "../utilities/hash.ts";
import { NewUser, UserRegistrationInput } from "../types/user.type.ts";
import { createUser, getUserByEmail } from "../repositories/users.repo.ts";

export async function createUserService(
  user: UserRegistrationInput,
): Promise<number> {
  let existingUser;

  try {
    // Check if user with the same email already exists
    existingUser = getUserByEmail(user.email);
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
  const newUserId = createUser({
    ...user,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    passwordHash: hashedPassword,
  } as NewUser);

  return newUserId;
}
