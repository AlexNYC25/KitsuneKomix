import {initLogger} from "#logger/loggers.ts"
import { startWatcher } from "./src/app/watcher.ts";

await initLogger();

const _watcher = startWatcher();