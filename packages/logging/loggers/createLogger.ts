import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import pino from "pino";

import { env } from "kitsune-komix-config";

export const createLogger = (destination: string): pino.Logger => {
	// Ensure the log directory and file exist before pino opens the stream.
	// Done synchronously because the logging package's init.ts side effect is
	// skipped when only a named logger is imported (Bun only evaluates the
	// re-exported modules it needs).
	mkdirSync(dirname(destination), { recursive: true });

	if (!existsSync(destination)) {
		writeFileSync(destination, "");
	}

	return pino({ level: env.LOG_LEVEL }, pino.destination(destination));
};
