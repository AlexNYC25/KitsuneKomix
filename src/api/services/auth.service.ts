import { getUserByEmail } from "../db/sqlite/models/users.model.ts";

import { verifyPassword } from "../utilities/hash.ts";

export const authenticateUser = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  // Verify the password (you should hash and compare in a real app)
  if (!(await verifyPassword(user.password_hash, password))) {
    throw new Error("Invalid password");
  }

  return { id: user.id, email: user.email, admin: user.admin === 1 };
};
