
/**
 * Default header authorization object.
 * Used to indicate that the authorization header
 * will be set by middleware in the apiClient.
 */
export const DEFAULT_HEADER_AUTHORIZATION = {
	authorization: '' // Will be overridden by middleware
};