
import chokidar from "chokidar";


chokidar.watch("/app/comics").on("all", (event, path) => {
  console.log(event, path);
});