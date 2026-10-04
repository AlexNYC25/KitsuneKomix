import { describe, expect, test } from "bun:test";

import {
	getQueueClient,
	getQueueJobs,
	getQueueOverview,
	QueueNames,
} from "kitsune-komix-database";

/**
 * Queue used purely for these tests. It is not one of the configured
 * QueueNames, so it can be cleared and reused without touching real queues.
 */
const TEST_QUEUE = "phase4_test_queue";

type TestPayload = {
	filePath?: string;
	marker: string;
};

const resetTestQueue = async (): Promise<void> => {
	const db = await getQueueClient();
	db.raw.exec(`DELETE FROM _honker_live WHERE queue = '${TEST_QUEUE}'`);
	db.raw.exec(`DELETE FROM _honker_dead WHERE queue = '${TEST_QUEUE}'`);
};

describe("processing queue status", () => {
	test("getQueueOverview returns an entry for every configured queue", async () => {
		const overview = await getQueueOverview();

		expect(overview.length).toBe(Object.values(QueueNames).length);

		for (const entry of overview) {
			expect(entry.pending).toBeGreaterThanOrEqual(0);
			expect(entry.processing).toBeGreaterThanOrEqual(0);
			expect(entry.dead).toBeGreaterThanOrEqual(0);
			expect(Array.isArray(entry.activeWorkers)).toBe(true);
		}
	});

	test("getQueueOverview reports active workers", async () => {
		await resetTestQueue();

		const db = await getQueueClient();
		const queue = db.queue(TEST_QUEUE);
		queue.enqueue({ filePath: "/libs/active.cbz", marker: "overview" });

		const claimed = queue.claimOne("phase4_overview_worker");
		expect(claimed).not.toBeNull();

		const overview = await getQueueOverview();
		const tempEntry = overview.find((entry) => entry.queue === "temp");

		expect(tempEntry?.activeWorkers.some(
			(worker) => worker.workerId === "phase4_overview_worker",
		)).toBe(true);

		claimed?.ack();
		await resetTestQueue();
	});

	test("getQueueJobs lists, filters and normalizes live jobs", async () => {
		await resetTestQueue();

		const db = await getQueueClient();
		const queue = db.queue(TEST_QUEUE);

		queue.enqueue({ filePath: "/libs/a.cbz", marker: "p4-a" } satisfies TestPayload);
		queue.enqueue({ filePath: "/libs/b.cbz", marker: "p4-b" } satisfies TestPayload);
		queue.enqueue({ marker: "p4-no-path" } satisfies TestPayload);

		const claimed = queue.claimOne("phase4_worker");

		const processing = await getQueueJobs({
			state: "processing",
			queue: TEST_QUEUE,
			limit: 50,
			offset: 0,
		});
		expect(processing.total).toBe(1);

		const claimedJob = processing.jobs[0];
		expect(claimedJob?.state).toBe("processing");
		expect(claimedJob?.workerId).toBe("phase4_worker");
		expect(claimedJob?.filePath).toBe("/libs/a.cbz");
		expect((claimedJob?.payload as TestPayload).marker).toBe("p4-a");

		const pending = await getQueueJobs({
			state: "pending",
			queue: TEST_QUEUE,
			limit: 50,
			offset: 0,
		});
		expect(pending.total).toBe(2);

		const noPathJob = pending.jobs.find(
			(job) => (job.payload as TestPayload).marker === "p4-no-path",
		);
		expect(noPathJob?.filePath).toBeNull();

		const all = await getQueueJobs({
			queue: TEST_QUEUE,
			limit: 50,
			offset: 0,
		});
		expect(all.total).toBe(3);

		const workerFiltered = await getQueueJobs({
			queue: TEST_QUEUE,
			workerId: "phase4_worker",
			limit: 50,
			offset: 0,
		});
		expect(workerFiltered.total).toBe(1);

		const paged = await getQueueJobs({
			state: "pending",
			queue: TEST_QUEUE,
			limit: 1,
			offset: 1,
		});
		expect(paged.total).toBe(2);
		expect(paged.jobs.length).toBe(1);

		claimed?.ack();
		await resetTestQueue();
	});

	test("getQueueJobs returns dead jobs with their last error", async () => {
		await resetTestQueue();

		const db = await getQueueClient();
		const queue = db.queue(TEST_QUEUE, { maxAttempts: 1 });

		queue.enqueue({ filePath: "/libs/dead.cbz", marker: "p4-dead" } satisfies TestPayload);

		const claimed = queue.claimOne("phase4_worker");
		expect(claimed).not.toBeNull();

		claimed?.fail("simulated failure");

		const dead = await getQueueJobs({
			state: "dead",
			queue: TEST_QUEUE,
			limit: 50,
			offset: 0,
		});
		expect(dead.total).toBe(1);

		const deadJob = dead.jobs[0];
		expect(deadJob?.state).toBe("dead");
		expect(deadJob?.lastError).toBe("simulated failure");
		expect(deadJob?.filePath).toBe("/libs/dead.cbz");
		expect(deadJob?.workerId).toBeNull();

		await resetTestQueue();
	});
});