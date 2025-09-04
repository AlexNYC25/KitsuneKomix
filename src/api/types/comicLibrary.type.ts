export type LibraryRow = {
  id: number;
  name: string;
  description: string | null;
  path: string;
  enabled: boolean;
  changed_at: string;
  created_at: string;
  updated_at: string;
};

export type LibraryDomain = {
  id: number;
  name: string;
  description?: string;
  path: string;
  enabled: boolean;
  changed_at: string;
  created_at: string;
  updated_at: string;
};

export type NewLibrary = {
  name: string;
  description?: string | null;
  path: string;
  enabled: boolean;
};

export type LibraryRegistrationInput = {
  name: string;
  description?: string | null;
  path: string;
  enabled: boolean;
};
