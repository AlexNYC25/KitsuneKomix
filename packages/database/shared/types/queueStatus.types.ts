export type QueueJobState = "pending" | "processing" | "dead";

/** Raw row shape from honker's _honker_live table (pending + processing). */
export type HonkerLiveRow = {
	id: number;
	queue: string;
	payload: string;
	state: string;
	priority: number;
	run_at: number;
	worker_id: string | null;
	claim_expires_at: number | null;
	attempts: number;
	max_attempts: number;
	created_at: number;
	expires_at: number | null;
};

/** Raw row shape from honker's _honker_dead table (terminal rows). */
export type HonkerDeadRow = {
	id: number;
	queue: string;
	payload: string;
	priority: number;
	run_at: number;
	attempts: number;
	max_attempts: number;
	last_error: string | null;
	created_at: number;
	died_at: number;
};

export type GetQueueJobsParams = {
	state?: QueueJobState;
	queue?: string;
	workerId?: string;
	limit: number;
	offset: number;
};

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
