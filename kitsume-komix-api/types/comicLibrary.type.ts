export type LibraryRegistrationInput = {
  name: string;
  description?: string;
  path: string;
  enabled?: boolean;
};

export type LibraryUpdateInput = {
  name?: string;
  description?: string;
  path?: string;
  enabled?: boolean;
};
