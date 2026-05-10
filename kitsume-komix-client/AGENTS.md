# KitsuneKomix Client Agent Guide

> Vue 3 + TypeScript + Pinia + PrimeVue frontend. 55 source files.

## OVERVIEW

Vite-powered SPA with auto-type-generation from API OpenAPI endpoint. Entry: `src/main.ts`.

## STRUCTURE

```
kitsume-komix-client/src/
├── components/    # Reusable Vue components (13 + subdirs)
│   ├── forms/     # Admin form dialogs (5)
│   ├── Settings/  # Settings page components (3)
│   └── icons/     # SVG icon components (5)
├── pages/         # Route-level page components (5)
├── stores/        # Pinia state stores (6)
├── types/         # TypeScript domain types (5)
├── utilities/     # API client, formatting, storage, etc. (7)
├── zod/           # Validation schemas (4)
├── interfaces/    # Auth interfaces (1)
├── config/        # Environment config (1)
└── openapi/       # Auto-generated API types (1)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| App init | `src/main.ts` | Pinia, Router, PrimeVue setup |
| Auth state | `src/stores/auth.ts` | Login/logout/session |
| API calls | `src/utilities/apiClient.ts` | Axios/fetch wrapper |
| Comic browsing | `src/stores/comic-series.ts`, `home.ts` | Data fetching + state |
| UI components | `src/components/` | SideBar, TopBar, ComicReader, etc. |
| Admin forms | `src/components/forms/` | CRUD dialogs (5 forms) |
| Type defs | `src/types/` | Domain types |

## CONVENTIONS

- **State**: Pinia stores in `stores/` — one store per domain
- **API client**: Centralized in `utilities/apiClient.ts`
- **Type gen**: Auto-generated from API via `pnpm dev` — polls localhost:8001/api/doc
- **UI library**: PrimeVue components throughout
- **Linting**: Airbnb TypeScript via `eslint.config.ts`
- **Testing**: Vitest with jsdom (`pnpm test:unit`)

## ANTI-PATTERNS

- **Type duplication**: Client has both manual types in `src/types/` AND generated types via OpenAPI
- **Dead icons**: `components/icons/` has Vue School template icons (unused in production code)
- **Hardcoded API URLs**: Check `utilities/urls.ts` and `utilities/apiClient.ts`
- **No e2e tests**: Only unit tests exist — no Playwright/Cypress

## COMMANDS

```bash
pnpm dev          # Dev (requires running API)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm test:unit    # Vitest
pnpm type-check   # vue-tsc
```
