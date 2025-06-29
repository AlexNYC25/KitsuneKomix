
/*
  Reflects the structure of the app_settings table in the database.
  Essentially the same as querying * from app_settings
*/
export interface AppSetting {
  id: number;
  setting_name: string;
  setting_value: string;
}
