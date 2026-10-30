const isDev = process.env.MODE === "development";
const bunCmd = isDev ? ["bun", "--watch"] : ["bun"];

const api = Bun.spawn({
	cmd: [...bunCmd, "run", "api"],
	stdout: "inherit",
	stdin: "inherit",
	stderr: "inherit",
});

const client = Bun.spawn({
	cmd: ["bun", "run", "client"],
	stdout: "inherit",
	stdin: "inherit",
	stderr: "inherit",
});

const watcher = Bun.spawn({
	cmd: [...bunCmd, "run", "watcher"],
	stdout: "inherit",
	stdin: "inherit",
	stderr: "inherit",
});

const worker = Bun.spawn({
	cmd: [...bunCmd, "run", "worker"],
	stdout: "inherit",
	stdin: "inherit",
	stderr: "inherit",
});

await Promise.all([api.exited, client.exited, watcher.exited, worker.exited]);
