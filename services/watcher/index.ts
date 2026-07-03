import { getQueueClient } from "kitsune-komix-database"

import { WatchManager } from "./watcher/manager";

const workerWatcher = new WatchManager();

const queueClient = await getQueueClient();

for await (const notif of queueClient.listen("watcher")) {
  console.log(notif.channel, notif.payload);
}