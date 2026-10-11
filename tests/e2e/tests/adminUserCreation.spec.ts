import { test, expect } from '@playwright/test';


test("Admin user can be created and later deleted", async ({ request }) => {
  const adminUserResponse = await request.post("localhost:3000/api/auth/sign-up/email", {
    data: {
      name: "Admin User",
      email: "testAdmin@example.com",
      password: "AdminPassword123!"
    }
    
  })

  expect(adminUserResponse.ok()).toBeTruthy();

  const deleteUserResponse = await request.delete("localhost:3000/api/users/1")
                   
})