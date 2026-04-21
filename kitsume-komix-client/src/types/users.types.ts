import type { paths } from "@/openapi/openapi-schema";

export type GetUsersResponse = paths["/users"]["get"]["responses"]["200"]["content"]["application/json"];

export type User = GetUsersResponse["users"][number];