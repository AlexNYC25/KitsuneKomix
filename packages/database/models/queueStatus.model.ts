import type { Database } from "@russellthehippo/honker-bun";

import { dbLogger } from "kitsune-komix-logging";

import { QueueNames } from "../config/queues.ts";
import { getQueueClient } from "../honker/client.ts";

import type {
	GetQueueJobsParams,
	HonkerDeadRow,
	HonkerLiveRow,
	QueueJobStatus,
	QueueJobState,
	QueueOverviewEntry,
} from "../shared/types/index.ts";

/**
 * Raised when the honker queue subsystem cannot be opened (e.g. the SQLite
 * extension is missing outside Docker). Routers map this to a 503 so the API
 * stays up without queue-backed features.
 */
export class QueueUnavailableError extends Error {
	constructor(message = "Queue subsystem is unavailable.") {
		super(message);
		this.name = "QueueUnavailableError";
	}
}

let honkerSchemaVerified = false;

/**
 * Fails loudly on first use if honker's internal table layout drifts from the
 * columns this model queries, so we catch it at startup instead of in a route.
 */
const verifyHonkerSchema = (raw: Database["raw"]): void => {
	if (honkerSchemaVerified) return;

	const columns = raw
		.query<{ name: string }, []>("PRAGMA table_info(_honker_live)")
		.all();

	const names = new Set(columns.map((column) => column.name));

	const required = [
		"id",
		"queue",
		"payload",
		"state",
		"worker_id",
		"claim_expires_at",
		"attempts",
		"max_attempts",
		"created_at",
		"run_at",
	];

	const missing = required.filter((column) => !names.has(column));

	if (missing.length > 0) {
		throw new Error(
			`Honker _honker_live schema drift: missing columns ${missing.join(", ")}`,
		);
	}

	honkerSchemaVerified = true;
};

const getQueueHandle = async (): Promise<Database> => {
	let db: Database;

	try {
		db = await getQueueClient();
	} catch (error) {
		dbLogger.error("Queue subsystem unavailable:" + error);
		const reason = error instanceof Error ? error.message : String(error);
		throw new QueueUnavailableError(
			`Queue subsystem is unavailable: ${reason}`,
		);
	}

	verifyHonkerSchema(db.raw);

	return db;
};

const parsePayload = (payload: string): Record<string, unknown> => {
	try {
		const parsed: unknown = JSON.parse(payload);

		if (
			parsed !== null &&
			typeof parsed === "object" &&
			!Array.isArray(parsed)
		) {
			return parsed as Record<string, unknown>;
		}
	} catch {
		// fall through to the empty default
	}

	return {};
};

const liveRowToQueueJobStatus = (
	row: HonkerLiveRow,
	state: QueueJobState,
): QueueJobStatus => {
	const payload = parsePayload(row.payload);
	const filePath =
		typeof payload.filePath === "string" ? payload.filePath : null;

	return {
		id: row.id,
		queue: row.queue,
		state,
		filePath,
		payload,
		workerId: row.worker_id,
		attempts: row.attempts,
		maxAttempts: row.max_attempts,
		createdAt: row.created_at,
		runAt: row.run_at,
		claimExpiresAt: row.claim_expires_at,
		lastError: null,
	};
};

const deadRowToQueueJobStatus = (row: HonkerDeadRow): QueueJobStatus => {
	const payload = parsePayload(row.payload);
	const filePath =
		typeof payload.filePath === "string" ? payload.filePath : null;

	return {
		id: row.id,
		queue: row.queue,
		state: "dead",
		filePath,
		payload,
		workerId: null,
		attempts: row.attempts,
		maxAttempts: row.max_attempts,
		createdAt: row.created_at,
		runAt: row.run_at,
		claimExpiresAt: null,
		lastError: row.last_error,
	};
};

/**
 * Per-queue counters plus an active-worker breakdown, merged against the
 * configured queue names so empty queues still show up with zeroes.
 */
export const getQueueOverview = async (): Promise<QueueOverviewEntry[]> => {
	const db = await getQueueHandle();

	try {
		const raw = db.raw;

		const liveRows =
			raw
				.query<{ queue: string; state: string; count: number }, []>(
					"SELECT queue, state, COUNT(*) AS count FROM _honker_live GROUP BY queue, state",
				)
				.all() ?? [];

		const deadRows =
			raw
				.query<{ queue: string; count: number }, []>(
					"SELECT queue, COUNT(*) AS count FROM _honker_dead GROUP BY queue",
				)
				.all() ?? [];

		const activeWorkerRows =
			raw
				.query<{ queue: string; worker_id: string; activeJobs: number }, []>(
					"SELECT queue, worker_id, COUNT(*) AS activeJobs FROM _honker_live WHERE state = 'processing' GROUP BY queue, worker_id",
				)
				.all() ?? [];

		return Object.values(QueueNames).map((queue) => {
			const live = liveRows.filter((row) => row.queue === queue);
			const deadCount = deadRows.find((row) => row.queue === queue)?.count ?? 0;
			const activeWorkers = activeWorkerRows
				.filter((row) => row.queue === queue)
				.map((row) => ({
					workerId: row.worker_id,
					activeJobs: row.activeJobs,
				}));

			return {
				queue,
				pending: live.find((row) => row.state === "pending")?.count ?? 0,
				processing: live.find((row) => row.state === "processing")?.count ?? 0,
				dead: deadCount,
				activeWorkers,
			};
		});
	} catch (error) {
		dbLogger.error("Error fetching queue overview:" + error);
		throw error;
	}
};

const getDeadJobs = (
	raw: Database["raw"],
	queue: string | undefined,
	limit: number,
	offset: number,
): { jobs: QueueJobStatus[]; total: number } => {
	const conditions: string[] = [];
	const values: Array<string | number> = [];

	if (queue) {
		conditions.push("queue = ?");
		values.push(queue);
	}

	const whereClause =
		conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

	const totalRow = raw
		.query<{ c: number }, Array<string | number>>(
			`SELECT COUNT(*) AS c FROM _honker_dead ${whereClause}`,
		)
		.get(...values);

	const rows = raw
		.query<HonkerDeadRow, Array<string | number>>(
			`SELECT * FROM _honker_dead ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
		)
		.all(...values, limit, offset);

	return {
		total: totalRow?.c ?? 0,
		jobs: rows.map(deadRowToQueueJobStatus),
	};
};

/**
 * Lists jobs from _honker_live (pending/processing) or _honker_dead,
 * newest first. `_honker_dead` has no worker_id column, so the worker
 * filter is only applied to live rows.
 */
export const getQueueJobs = async (
	params: GetQueueJobsParams,
): Promise<{ jobs: QueueJobStatus[]; total: number }> => {
	const db = await getQueueHandle();

	const { state, queue, workerId, limit, offset } = params;

	try {
		const raw = db.raw;

		if (state === "dead") {
			return getDeadJobs(raw, queue, limit, offset);
		}

		const conditions: string[] = [];
		const values: Array<string | number> = [];

		if (state) {
			conditions.push("state = ?");
			values.push(state);
		}
		if (queue) {
			conditions.push("queue = ?");
			values.push(queue);
		}
		if (workerId) {
			conditions.push("worker_id = ?");
			values.push(workerId);
		}

		const whereClause =
			conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

		const totalRow = raw
			.query<{ c: number }, Array<string | number>>(
				`SELECT COUNT(*) AS c FROM _honker_live ${whereClause}`,
			)
			.get(...values);

		const rows = raw
			.query<HonkerLiveRow, Array<string | number>>(
				`SELECT * FROM _honker_live ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
			)
			.all(...values, limit, offset);

		return {
			total: totalRow?.c ?? 0,
			jobs: rows.map((row) =>
				liveRowToQueueJobStatus(row, row.state as QueueJobState),
			),
		};
	} catch (error) {
		dbLogger.error("Error fetching queue jobs:" + error);
		throw error;
	}
};
