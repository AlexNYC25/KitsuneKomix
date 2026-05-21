import type { paths } from "@/openapi/openapi-schema";

/**
 * Relaxes the authorization header type requirement across all OpenAPI paths.
 * Allows authenticated routes to omit explicit header parameters since the
 * auth middleware injects the Bearer token automatically at runtime.
 */

type RelaxedHeader<Header> = Header extends Record<string, unknown>
	? Omit<Header, "authorization"> & {
		authorization?: Header extends { authorization: infer Authorization }
			? Authorization
			: string;
	}
	: Header;

type RelaxedParameters<Parameters> = Parameters extends { header: infer Header }
	? Omit<Parameters, "header"> & { header?: RelaxedHeader<Header> }
	: Parameters;

type RelaxedOperation<Operation> = Operation extends { parameters: infer Parameters }
	? Omit<Operation, "parameters"> & { parameters: RelaxedParameters<Parameters> }
	: Operation;

type RelaxedPathItem<PathItem> = {
	[Key in keyof PathItem]: Key extends "get" | "post" | "put" | "patch" | "delete" | "options" | "head" | "trace"
		? RelaxedOperation<PathItem[Key]>
		: PathItem[Key];
};

export type AuthRelaxedPaths = {
	[Path in keyof paths]: RelaxedPathItem<paths[Path]>;
};
