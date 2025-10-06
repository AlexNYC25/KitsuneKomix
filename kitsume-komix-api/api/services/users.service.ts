import { hashPassword } from "../../utilities/hash.ts";
import { UserRegistrationInput } from "../../types/index.ts";
import { createUser, getUserByEmail, getUserById } from "../../db/sqlite/models/users.model.ts";
import { assignLibraryToUser, getComicLibraryById } from "../../db/sqlite/models/comicLibraries.model.ts";

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

/**
 * Assign a comic library to a user
 * @param userId 
 * @param libraryId 
 */
export async function assignLibraryToUserService(
  userId: number,
  libraryId: number,
): Promise<void> {
  // first we want to validate that the userId and libraryId exist in their respective tables
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("User does not exist");
    }
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Internal server error");
  }

  try {
    const library = await getComicLibraryById(libraryId);
    if (!library) {
      throw new Error("Library does not exist");
    }
  } catch (error) {
    console.error("Error fetching library by ID:", error);
    throw new Error("Internal server error");
  }


  try {
    await assignLibraryToUser(userId, libraryId);
  } catch (error) {
    console.error("Error assigning library to user:", error);
    throw new Error("Internal server error");
  }
}
