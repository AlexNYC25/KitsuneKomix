import { Context } from "hono";

import { adminService } from "../services/admin.service.ts";

export const adminController = {
  purgeAllData: (c: Context) => {
    try {
      adminService.purgeAllData();
      return c.json({ message: "All data purged successfully" }, 200);
    } catch (error) {
      console.error("Error purging data:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },
};