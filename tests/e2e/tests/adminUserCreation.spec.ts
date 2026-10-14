import { test, expect, type APIResponse } from '@playwright/test';

const sessionCookie = (response: APIResponse) =>
  response
    .headersArray()
    .filter((header) => header.name === "set-cookie")
    .map((header) => header.value.split(";")[0])
    .join("; ");

test("Admin user can be created and later deleted", async ({ request }) => {
  const credentials = {
    name: "Admin User",
    email: "testAdmin@example.com",
    password: "AdminPassword123!"
  };

  const staleSignInResponse = await request.post("/api/auth/sign-in/email", {
    data: {
      email: credentials.email,
      password: credentials.password
    }
  })

  if (staleSignInResponse.ok()) {
    const { user: staleUser } = await staleSignInResponse.json();
    await request.delete(`/api/users/${staleUser.id}`, {
      headers: { cookie: sessionCookie(staleSignInResponse) }
    })
  }

  const signUpResponse = await request.post("/api/auth/sign-up/email", {
    data: credentials
  })

  expect(signUpResponse.ok()).toBeTruthy();

  const { user } = await signUpResponse.json();
  expect(user.id).toBeTruthy();

  const deleteUserResponse = await request.delete(`/api/users/${user.id}`, {
    headers: { cookie: sessionCookie(signUpResponse) }
  })

  expect(deleteUserResponse.ok()).toBeTruthy();
  expect(await deleteUserResponse.json()).toEqual({ deleted: true });
})
