import packageJson from "#root/deno.json" with { type: "json" };

import { AppMetadataConfig } from "#types/index.ts";

const metadata = packageJson as AppMetadataConfig;

export const appMeta = {
	name: metadata.name ?? "kitsume-komix-api",
	version: metadata.version ?? "0.0.0",
	description: metadata.description ?? "",
} as const;