# KitsuneKomix Client -- Codebase Improvement Plan

> Generated: May 2026
> Scope: `kitsume-komix-client/src/`

---

## Priority 1: Critical (Fix Immediately)

### 1.1 Extract Hardcoded URLs to Environment Variables

**Problem:** `http://localhost:8001` is hardcoded in three places:
- `utilities/apiClient.ts` (lines 8-9)
- `stores/home.ts` (thumbnail URL construction)
- `pages/ComicBookPage.vue` (download endpoint)

**Impact:** Zero configurability; breaks in any non-local environment.

**Fix:**
- Add `VITE_API_URL` to `.env` files
- Create `utilities/config.ts` with a single source of truth for base URLs
- Replace all hardcoded strings with `import.meta.env.VITE_API_URL`

---

### 1.2 Fix Typos

| Location | Current | Correct |
|----------|---------|---------|
| `utilities/formating.ts` | `formating.ts` | `formatting.ts` |
| `types/users.types.ts:11` | `UserRegistractionPayload` | `UserRegistrationPayload` |

**Impact:** Breaks IDE autocomplete, looks unprofessional, causes confusion.

---

### 1.3 Consolidate Thumbnail/Thumbnail URL Construction

**Problem:** The pattern of extracting a filename from a path and building a thumbnail URL is duplicated across:
- `pages/ComicSeriesPage.vue` -- `getThumbnailPathFromFilePath()`
- `pages/ComicBookPage.vue` -- inline URL construction
- `stores/home.ts` -- URL concatenation
- `components/ComicReader.vue` -- page URL construction

**Fix:** Create a single utility in `utilities/image.ts`:
```ts
export function buildThumbnailUrl(filePath: string): string
export function buildComicPageUrl(comicId: number, pagePath: string): string
```

---

### 1.4 Remove Dead Code

| File(s) | Reason |
|---------|--------|
| `components/icons/` (5 files) | Default Vue scaffold icons, never imported |
| `components/__tests__/HelloWorld.spec.ts` | Tests `HelloWorld.vue` which doesn't exist |
| `stores/home.ts` -- duplicate fetch logic | `fetchLatestSeries` and `fetchUpdatedSeries` are nearly identical |
| `utilities/constants.ts` -- `DEFAULT_HEADER_AUTHORIZATION` | Auth middleware handles this; constant is redundant |
| `pages/ComicSeriesPage.vue` -- duplicate sort function | Sort-by-issue-number logic appears twice in the same file |

---

## Priority 2: High (Do Next Sprint)

### 2.1 Create Dedicated Router Module

**Problem:** All routes are defined inline in `main.ts` (lines 43-51) alongside plugin setup and auth guards.

**Fix:**
- Create `src/router/index.ts`
- Move route definitions there
- Add a formal type for route meta (`requiresAuth`, `layout`)
- Add a 404 catch-all route

---

### 2.2 Complete `types/index.ts` Barrel Export

**Problem:** Only exports 2 of 4 type modules:
```ts
// Current
export * from './comic-series.types';
export * from './comic-books.types';
// Missing: users.types, comic-libraries.types
```

**Impact:** Consumers cannot do `import type { User } from '@/types'`.

---

### 2.3 Merge `interfaces/` into `types/`

**Problem:** `interfaces/` contains a single file (`auth.interfaces.ts`). There's no clear rationale for splitting `types/` and `interfaces/` at the directory level.

**Fix:** Move `auth.interfaces.ts` into `types/` and delete the `interfaces/` directory. Pick a convention (`type` aliases or `interface` declarations) and stick with it.

---

### 2.4 Extract Form Modal Wrapper Component

**Problem:** Every form modal in `components/forms/` and `LibrarySettings.vue` duplicates ~20+ Tailwind classes for positioning:
```
fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 ...
```

**Fix:** Create `components/ui/FormModal.vue` (or `ModalDialog.vue`) that accepts:
- `title` slot or prop
- `modelValue` for visibility
- Default slot for form content

**Impact:** Eliminates ~100+ lines of duplicated markup across 6+ components.

---

### 2.5 Consistent Props Typing

**Problem:** Two patterns are mixed:

```ts
// Pattern A -- Typed (newer components)
const props = defineProps<{
  comicSeriesData: ComicSeriesCarouselItem[];
  labelText: string;
}>();

// Pattern B -- Runtime (older components)
const props = defineProps({
  comicMetadataDetailsLabel: String,
  comicMetadataDetails: String,
  maxVisible: { type: Number, default: 5 }
});
```

**Fix:** Migrate all components to Pattern A (typed `defineProps<{...}>()`). It provides better type inference and IDE support.

---

### 2.6 Consistent Zod Schema Messages

**Problem:** Validation messages use two different syntaxes:

```ts
// Object-style (login.schema.ts, signup.schema.ts)
z.string().email({ message: "Invalid email address" })

// String-style (users.schema.ts, Zod v4 syntax)
z.email('Invalid email address')
z.string().min(6, 'Password must be at least 6 characters long')
```

**Fix:** Standardize on one syntax across all schemas. Also consider sharing base schemas between `login.schema.ts` and `signup.schema.ts` since they validate the same email/password fields.

---

### 2.7 Consistent Import Paths

**Problem:** Mix of `@/` alias and relative imports for `src/` files:
```ts
// Alias style (most common)
import ComicThumbnail from '@/components/ComicThumbnail.vue';

// Relative style (ComicBookPage.vue)
import ComicSeriesPageDetails from '../components/ComicSeriesPageDetails.vue';
```

**Fix:** Enforce `@/` alias for all `src/` imports. Add an ESLint rule (`import-x/no-relative-packages` or a custom pattern) to catch violations.

---

### 2.8 Consistent `.ts` Extension on Imports

**Problem:**
```ts
// With .ts extension
import { validateEmailPassword } from '@/zod/login.schema.ts';

// Without .ts extension
import { userSignUpSchema } from '@/zod/users.schema';
```

**Fix:** Standardize on no extension (let bundler resolve). Add ESLint rule to enforce consistency.

---

## Priority 3: Medium (Improve Developer Experience)

### 3.1 Remove Redundant Pass-Through Getters

**Problem:** Stores define getters that just return state with no transformation:
```ts
// stores/home.ts
getLatestSeries: (state) => state.latestSeries,
getUpdatedSeries: (state) => state.updatedSeries,

// stores/users.ts
getUsers: (state) => state.users,

// stores/libraries.ts
getLibraries: (state) => state.libraries,
```

**Fix:** Remove these getters. Consumers should access state directly. Keep getters only when they compute or transform data.

---

### 3.2 Consistent Error Handling Across Stores

**Problem:**
- `home.ts`, `libraries.ts`, `comic-series.ts` -- `throw new Error(...)`
- `users.ts` -- `console.error` and return early
- `users.ts` has a dead code block: `if (!error) {}`

**Fix:** Pick a strategy (throw errors and let callers handle, or return result objects) and apply consistently.

---

### 3.3 Remove Empty `<style scoped>` Blocks

**Components with empty style blocks:**
- `components/SideBar.vue`
- `pages/HomePage.vue`
- `pages/LoginPage.vue`
- `pages/SettingsPage.vue`
- `pages/ComicSeriesPage.vue`

**Fix:** Remove them. They add noise and imply "styling lives here" when it doesn't.

---

### 3.4 Refactor ComicBookPage.vue Metadata Computed Properties

**Problem:** Creates 15+ separate computed properties (`writersString`, `pencillersString`, `inkersString`, etc.) that all follow the same pattern:
```ts
const writersString = computed(() => metadataFieldToString(bookMetadata?.writers));
const pencillersString = computed(() => metadataFieldToString(bookMetadata?.pencillers));
// ... 13 more
```

**Fix:** Use a data-driven approach with a single computed that returns a record or array.

---

### 3.5 Fix Inconsistent Getter Styles

**Problem:**
```ts
// Function-style (comic-series.ts)
getComicSeriesData(state): Array<ComicSeriesResponseItem> {
  return state.comicSeriesData;
}

// Arrow-style (home.ts)
getLatestSeries: (state) => state.latestSeries,
```

**Fix:** Pick one style. Arrow functions are more concise and consistent with modern Pinia patterns.

---

### 3.6 Address Circular Dependency TODO in Auth Store

**Problem:** `stores/auth.ts` (lines 29-37) has a documented TODO with a `setTimeout` workaround:
```ts
// TODO: Refactor to avoid circular dependency, update docs
if (state.token && state.user) {
  setTimeout(async () => {
    const authStore = useAuthStore();
    setTokenRefreshCallback(() => authStore.refresh());
    await authStore.postLoginActions();
  }, 0);
}
```

**Fix:** Restructure so that `setTokenRefreshCallback` and `postLoginActions` are called from the component that triggers login (e.g., `LoginForm.vue`), not from within the store's own initialization.

---

### 3.7 Remove `w-70` Non-Standard Tailwind Value

**Problem:** `components/ComicThumbnail.vue` uses `w-70` which is not a default Tailwind spacing value.

**Fix:** Either add a custom spacing configuration in Tailwind config, or use an arbitrary value (`w-[17.5rem]`) or the closest standard value (`w-72`).

---

### 3.8 Inline or Consolidate Single-Function Utilities

**Problem:** `utilities/metadata.ts` contains a single function `convertArrayOfCreditsToString()`. `utilities/constants.ts` contains a single redundant constant.

**Fix:** Either:
- Inline these where used, or
- Group related utilities into a single file (e.g., `utilities/formatting.ts` for all string/formatting helpers)

---

## Priority 4: Low (Nice-to-Have)

### 4.1 Improve ESLint Configuration

Consider adding:
- `import-x` plugin for import ordering and consistency rules
- `vue-eslint-parser` rules for `<script setup>` specific patterns
- Explicit rule for import path style (`@/` vs relative)

---

### 4.2 Improve Prettier Configuration

Add explicit values for currently-defaulted settings:
```json
{
  "trailingComma": "es5",
  "tabWidth": 2,
  "singleQuote": true,
  "semi": false,
  "printWidth": 100
}
```

---

### 4.3 Standardize Store Naming

`stores/home.ts` is named after a page, but it fetches comic series data. Consider renaming to `stores/comic-home.ts` or `stores/dashboard.ts` to reflect its domain purpose.

---

### 4.4 Add TypeScript Path Alias for Subdirectories

Consider adding shorter aliases for commonly imported directories:
```json
// tsconfig.app.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@stores/*": ["./src/stores/*"],
      "@types/*": ["./src/types/*"]
    }
  }
}
```

---

### 4.5 Add Component Documentation

Add JSDoc comments to complex components, especially:
- `ComicReader.vue` (766 lines)
- `HomePageGalleria.vue` (currently uses hardcoded placeholder images)

---

## Quick Wins Checklist

- [ ] Rename `formating.ts` -> `formatting.ts`
- [ ] Rename `UserRegistractionPayload` -> `UserRegistrationPayload`
- [ ] Delete `components/icons/` directory
- [ ] Delete `components/__tests__/HelloWorld.spec.ts`
- [ ] Remove empty `<style scoped>` blocks from 5 components
- [ ] Remove `DEFAULT_HEADER_AUTHORIZATION` from `constants.ts`
- [ ] Remove duplicate sort function in `ComicSeriesPage.vue`
- [ ] Add missing exports to `types/index.ts`

## Effort Estimate

| Priority | Items | Estimated Effort |
|----------|-------|------------------|
| Critical | 4 items | 2-3 hours |
| High | 8 items | 1-2 days |
| Medium | 8 items | 2-3 days |
| Low | 5 items | 1 day |

**Total estimated effort:** 1-1.5 weeks for a single developer
