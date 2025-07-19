import { Router } from "@oak/oak";
import { updateAppSettingQuery } from "../../../database/queries/appSettings.ts";

const purgeRouter = new Router({ prefix: "/admin/purge" });

purgeRouter.get("/reset-hash", (ctx) => {
  // Reset the comic_folder_hash to "NOT_SET"
  updateAppSettingQuery("comic_folder_hash", "NOT_SET");
  ctx.response.status = 200;
  ctx.response.body = { message: "comic_folder_hash has been reset." };
});

export default purgeRouter;