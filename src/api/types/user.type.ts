import { User, NewUser } from "./database.types.ts";

// Re-export database types
export type { User, NewUser };

// Legacy types for backward compatibility
export type UserRow = User;

export type UserDomain = {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  admin: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserRegistrationInput = {
  username: string;
  email: string;
  password: string; // plain text from client
  firstName?: string;
  lastName?: string;
};

export type UserLoginInput = {
  username: string;
  password: string;
};

export type UserUpdateInput = {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

// Safe user type without sensitive data
export type SafeUser = Omit<User, 'password_hash'>;
