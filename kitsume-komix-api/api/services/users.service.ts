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

import { getSetting, setSetting } from "#sqlite/models/appSettings.model.ts";

/**
 * Checks whether initial application setup has been completed.
 *
 * This reads the `appSetupComplete` flag from application settings.
 *
 * @returns `true` when setup is complete, otherwise `false`.
 * @throws {Error} Throws when the setup status cannot be read.
 */
export async function checkIfAppSetupComplete(): Promise<boolean> {
  try {
    const settingValue = await getSetting("appSetupComplete");
    return settingValue === "true";
  } catch (error) {
    console.error("Error checking app setup status:", error);
    throw new Error("Internal server error");
  }
}


/**
 * Creates a new user and applies first-user setup rules.
 *
 * - Prevents duplicate users by email.
 * - Hashes the provided password before persistence.
 * - If app setup is not complete, marks setup complete and creates the user as admin.
 * - Otherwise, creates the user as a non-admin.
 *
 * @param user - Registration payload for the new user.
 * @returns The newly created user ID.
 * @throws {Error} Throws when validation fails or persistence operations fail.
 */
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

  // if this is the first user being created, we will make them an admin and mark app setup as complete
  if (!existingUser) {
    const appSetupComplete = await checkIfAppSetupComplete();

    if (!appSetupComplete) {
      // Mark app setup as complete
      await setSetting("appSetupComplete", "true");

      // Create the user as an admin
      const newUserId = await createUser({
        username: user.username,
        email: user.email,
        passwordHash: hashedPassword,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        admin: 1, // Make the first user an admin
      });

      return newUserId;
    }
  }

  // For subsequent users, create them as non-admins

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
 * Deletes an existing user by ID.
 *
 * @param userId - ID of the user to delete.
 * @returns `true` when the user is deleted.
 * @throws {Error} Throws when the user does not exist or deletion fails.
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
 * Assigns a comic library to a user.
 *
 * Validates that both the user and library exist before creating the assignment.
 *
 * @param userId - Target user ID.
 * @param libraryId - Target comic library ID.
 * @returns Resolves when the assignment completes.
 * @throws {Error} Throws when validation fails or the assignment operation fails.
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
