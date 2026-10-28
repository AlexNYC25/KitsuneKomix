const api = Bun.spawn({
	cmd: ["bun", "run", "api"],
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
	cmd: ["bun", "run", "watcher"],
	stdout: "inherit",
	stdin: "inherit",
	stderr: "inherit",
});

const worker = Bun.spawn({
	cmd: ["bun", "run", "worker"],
	stdout: "inherit",
	stdin: "inherit",
	stderr: "inherit",
});

await Promise.all([api.exited, client.exited, watcher.exited, worker.exited]);
