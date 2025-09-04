import { Context } from "hono";
import { ZodSafeParseResult } from "zod";

import { UserSchema } from "../schemas/user.schema.ts";
import { UserRegistrationInput } from "../types/user.type.ts";
import { createUserService } from "../services/users.service.ts";

export const userController = {
  createUser: async (c: Context) => {
    try {
      const userData: UserRegistrationInput = await c.req.json();
      const parsed: ZodSafeParseResult<UserRegistrationInput> = UserSchema
        .safeParse(userData);

      if (!parsed.success) {
        return c.json({
          message: "Invalid user data",
          errors: parsed.error.flatten(),
        }, 400);
      }

      // Use the service layer to handle user creation logic
      const newUserId = await createUserService(parsed.data);

      return c.json({
        message: `User[${parsed.data.email}] created successfully`,
        userId: newUserId,
      }, 201);
    } catch (error) {
      console.error("Error parsing JSON or creating user:", error);
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        return c.json({ message: "Invalid JSON format in request body" }, 400);
      }
      return c.json({ message: "Internal server error" }, 500);
    }
  },
};
