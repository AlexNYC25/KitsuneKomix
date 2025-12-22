import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
} from "#sqlite/models/users.model.ts";
import {
  assignLibraryToUser,
  getComicLibraryById,
} from "#sqlite/models/comicLibraries.model.ts";

import { hashPassword } from "#utilities/hash.ts";

import { UserRegistrationInput } from "#types/index.ts";

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
    passwordHash: hashedPassword,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    admin: 0, // Default to non-admin
  });

  return newUserId;
}

/**
 * @param userId ID of the user to delete
 * @returns True if the user was deleted, false otherwise.
 */
export const deleteUserService = async (userId: number): Promise<boolean> => {
  // First, check if the user exists
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("User does not exist");
    }
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Internal server error");
  }

  // Proceed to delete the user
  try {
    const deleted = await deleteUser(userId);
    if (!deleted) {
      throw new Error("Failed to delete user");
    }
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Internal server error");
  }
};

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
