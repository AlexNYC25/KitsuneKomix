import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
	// Unauthenticated routes
	{
		name: "unauthenticated",
		path: "/login",
		component: () => import("../views/SingleViewUnauthenticated.vue"),
		meta: { requiresAuth: false },
		children: [
			{
				path: "",
				name: "login",
				component: () => import("../views/LoginView.vue"),
			},
		],
	},
	// Authenticated routes
	{
		path: "/",
		component: () => import("../views/SplitView.vue"),
		name: "home",
		meta: { requiresAuth: true },
		children: [
			{
				path: "",
				name: "dashboard",
				component: () => import("../views/DashboardView.vue"),
			},
		],
	},
];
