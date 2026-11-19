import { authClient } from "~/utils/auth-client";

/**
 * Redirects unauthenticated visitors to the login page.
 * /login is always allowed so signed-out users can reach it.
 */
export default defineNuxtRouteMiddleware(async (to) => {
	if (to.path === "/login") return;

	const { data: session } = await authClient.useSession(useFetch);

	if (!session.value?.user) {
		return navigateTo("/login");
	}
});
