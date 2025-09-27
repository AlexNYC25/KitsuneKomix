import { AppSetting, NewAppSetting } from "./database.types.ts";

// Re-export database types
export type { AppSetting, NewAppSetting };

export type AppSettingInput = {
  key: string;
  value: string;
  adminOnly?: boolean;
};

export type AppSettingUpdate = {
  value?: string;
  adminOnly?: boolean;
};

export type AppSettingSearchParams = {
  key?: string;
  adminOnly?: boolean;
};
