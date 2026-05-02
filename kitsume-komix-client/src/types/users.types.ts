import type { paths } from "@/openapi/openapi-schema";

export type GetUsersResponse = paths["/users"]["get"]["responses"]["200"]["content"]["application/json"];

export type User = GetUsersResponse["users"][number];

export type UserRegistrationRequestBody = NonNullable<
  paths['/users/create-user']['post']['requestBody']
>;

export type UserRegistractionPayload = UserRegistrationRequestBody['content']['application/json']

export type UserEditRequestBody = NonNullable<
  paths['/users/edit-user']['post']['requestBody']
>;

export type UserEditPayload = UserEditRequestBody['content']['application/json']