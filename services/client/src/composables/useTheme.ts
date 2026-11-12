import { computed, ref, watch } from "vue";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";

const preference = ref<ThemePreference>(
	(localStorage.getItem(STORAGE_KEY) as ThemePreference) || "system",
);

const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");

const resolvedTheme = computed<ResolvedTheme>(() => {
	if (preference.value === "system") {
		return systemPreference.matches ? "dark" : "light";
	}

	return preference.value;
});

function applyTheme(theme: ResolvedTheme) {
	const root = document.documentElement;

	root.dataset.theme = theme;
	root.style.colorScheme = theme;
}

watch(resolvedTheme, (theme) => applyTheme(theme), { immediate: true });

function setTheme(theme: ThemePreference) {
	preference.value = theme;
	localStorage.setItem(STORAGE_KEY, theme);
}

systemPreference.addEventListener("change", () => {
	if (preference.value === "system") {
		applyTheme(resolvedTheme.value);
	}
});

export function useTheme() {
	return {
		preference,
		resolvedTheme,
		setTheme,
	};
}
