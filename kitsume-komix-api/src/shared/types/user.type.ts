export type UserRegistrationInput = {
  username: string;
  email: string;
  password: string; // plain text from client
  firstName?: string;
  lastName?: string;
};
