export type QueueJobState = "pending" | "processing" | "dead";

/**
 * Normalized view of a honker job, sourced from _honker_live/_honker_dead.
 * The queue name is the honker value (e.g. "book_record"), not the
 * QueueNames key.
 */
export interface QueueJobStatus {
	id: number;
	queue: string;
	state: QueueJobState;
	/** Parsed from payload.filePath; null when the payload has no file path. */
	filePath: string | null;
	payload: Record<string, unknown>;
	workerId: string | null;
	attempts: number;
	maxAttempts: number;
	/** Unix epoch seconds (honker timebase). */
	createdAt: number;
	runAt: number;
	claimExpiresAt: number | null;
	lastError: string | null;
}

/** Per-queue counters + active worker breakdown for a dashboard overview. */
export interface QueueOverviewEntry {
	queue: string;
	pending: number;
	processing: number;
	dead: number;
	activeWorkers: {
		workerId: string;
		activeJobs: number;
	}[];
}