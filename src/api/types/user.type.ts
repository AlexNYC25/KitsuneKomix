export type UserRow = {
  id: number;
  username: string;
  email: string;
  password_hash: string;       // stored hash
  first_name: string | null;
  last_name: string | null;
};

export type UserDomain = {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Date;            // optional if you store timestamps
};

export type NewUser = {
  username: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
};

export type RegistrationInput = {
  username: string;
  email: string;
  password: string;   // plain text from client
  firstName?: string;
  lastName?: string;
};
