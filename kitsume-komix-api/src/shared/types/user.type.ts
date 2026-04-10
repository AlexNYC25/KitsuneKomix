export type UserRegistrationInput = {
  email: string;
  password: string; // plain text from client
  firstName?: string;
  lastName?: string;
};
