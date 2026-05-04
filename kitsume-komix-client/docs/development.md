# KitsuneKomix Client Development Guide

This document outlines the coding standards, architecture patterns, and development workflow for the KitsuneKomix Client application. As we transition toward open-source, following these guidelines ensures consistency, maintainability, and a positive contributor experience.

---

## 🏗️ Project Structure

The client follows a modular structure to separate concerns:

```
src/
├── components/     # Reusable Vue components
├── interfaces/     # External libraries type interfaces
├── pages/          # Page-level components (routes)
├── stores/         # Pinia stores (business logic)
├── types/          # TypeScript type definitions
├── openapi/        # Generated API schemas
├── zod/            # Zod schemas for validation
├── utilities/      # Helper functions, composables
├── assets/         # Static assets
├── App.vue         # Root component
└── main.ts         # Application entry point
```

---

## 📝 Code Style & Formatting

### Indentation
- Use **2 spaces** for indentation (not tabs)
- Consistent spacing throughout all files

```typescript
// ✅ CORRECT
function myFunction() {
  const x = 1;
  const y = 2;
}

// ❌ INCORRECT
function myFunction() {
const x = 1;
const y = 2;
}
```

### Line Length
- Max line length: **100 characters**
- Auto-wrapping for long lines

### Quotes
- Use **single quotes** for strings
- Auto semicolons (no trailing semicolons)

```typescript
// ✅ CORRECT
const message = 'Hello World'

// ❌ INCORRECT
const message = "Hello World"
```

---

## 📦 TypeScript & Type Safety

### Use OpenAPI Schema Types
Always prefer types generated from the OpenAPI schema over manual type definitions when possible.

```typescript
// ✅ PREFER - Generated from OpenAPI
import type { ComicSeries } from '@/openapi/openapi-schema'

// ❌ AVOID - Manual type when API type exists
type ComicSeries = {
  id: string
  title: string
}
```

### Type Definitions Location
- Store type definitions in `src/types/`
- Export from `src/types/index.ts` for easy imports
- Keep one type file per domain (e.g., `users.types.ts`, `comic-series.types.ts`)

```typescript
// src/types/index.ts
export * from './users.types'
export * from './comic-series.types'
export * from './comic-libraries.types'
```

### Interface Usage
- Use interfaces for external type definitions
- Use types for internal type definitions
- Prefer interfaces for flexibility in Vue components

```typescript
// For external APIs
interface ComicSeriesResponse {
  id: number
  title: string
}

// For internal state
type ComicSeriesState = {
  id: string
  title: string
  isLoading: boolean
}
```

---

## 🏪 Pinia Stores (Business Logic)

### Store Organization
Each store should handle a single domain concern:

```
src/stores/
├── auth.ts          # Authentication & user session
├── comic-series.ts  # Comic series data
├── comic-books.ts   # Individual comic books
├── libraries.ts     # User libraries
└── users.ts         # User-related logic
```

### Store Structure
Follow this pattern for all stores:

```typescript
// ✅ GOOD STORE PATTERN
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useComicSeriesStore = defineStore('comicSeries', () => {
  // State
  const seriesList = ref<ComicSeries[]>([])
  const loading = ref(false)

  // Getters
  const totalSeries = computed(() => seriesList.value.length)

  // Actions
  async function fetchSeries() {
    loading.value = true
    try {
      const response = await fetch('/api/series')
      seriesList.value = await response.json()
    } finally {
      loading.value = false
    }
  }

  return { seriesList, loading, totalSeries, fetchSeries }
})
```

### Composables
- Extract reusable logic into composables in `src/utilities/`
- Keep stores focused on state management
- Use composables for UI logic, API calls, validation

```typescript
// ✅ COMPOSABLE PATTERN
import { useComicSeriesStore } from '@/stores/comic-series'
import { useDebounce } from '@/utilities/debounce'

export function useComicSeries() {
  const seriesStore = useComicSeriesStore()

  const searchResults = useDebounce(
    (query: string) => seriesStore.searchSeries(query),
    300
  )

  return { seriesStore, searchResults }
}
```

---

## 🧪 Testing

### Test Structure
```
src/
├── __tests__/
│   ├── components/
│   ├── stores/
│   └── utilities/
```

### Test Requirements
- All store actions must have corresponding tests
- Critical components need unit tests
- Use Vitest (already configured in `vitest.config.ts`)

```typescript
// Example store test
import { describe, it, expect } from 'vitest'
import { useComicSeriesStore } from '@/stores/comic-series'

describe('useComicSeriesStore', () => {
  it('should fetch series list', async () => {
    const seriesStore = useComicSeriesStore()
    await seriesStore.fetchSeries()
    expect(seriesStore.loading).toBe(false)
    expect(seriesStore.seriesList.length).toBeGreaterThan(0)
  })
})
```

### Running Tests
```bash
pnpm test:unit
```

---

## 🔄 API Integration

### OpenAPI Schema
- API types are auto-generated via `pnpm generate-api-types`
- Keep generated files in `src/openapi/`
- Don't manually edit generated types

### API Calls
Use `openapi-fetch` for consistent API calls:

```typescript
import { initOpenApi } from '@/openapi/openapi-schema'

const apiClient = initOpenApi()

// GET request
const series = await apiClient.GET('/series')

// POST request
const response = await apiClient.POST('/series', {
  title: 'My Series',
  // ...
})
```

---

## 🚀 Environment Setup

### Development
```bash
# Start both API and Client
cd kitsume-komix-client
pnpm dev
```

The `dev` script will:
1. Attempt to poll the API for OpenAPI schema (up to 30 seconds)
2. Generate TypeScript types automatically
3. Start the Vite development server

### Building
```bash
# Build for production
pnpm build
```

### Linting & Formatting
```bash
# Fix linting issues
pnpm lint

# Format code
pnpm format
```

---

## 🎨 UI Components

### PrimeVue & Tailwind
- Use PrimeVue components from `@primevue/`
- Use Tailwind for utility classes
- Follow the existing design system in `assets/`

### Component Structure
```vue
<!-- ✅ GOOD COMPONENT STRUCTURE -->
<template>
  <div class="comic-card">
    <h2 class="title">{{ title }}</h2>
    <p class="description">{{ description }}</p>
    <button @click="handleClick">Read More</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, emit } from 'vue'

interface Props {
  title: string
  description: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'readMore', seriesId: string): void
}>()
</script>
```

---

## 📋 Code Review Checklist

Before committing, verify:

- [ ] Code formatted with `pnpm format`
- [ ] No linting errors with `pnpm lint`
- [ ] Types are correct and from OpenAPI schema
- [ ] Pinia stores follow the established pattern
- [ ] New code includes appropriate tests
- [ ] No manual type definitions when API types exist
- [ ] 2-space indentation throughout
- [ ] Line length under 100 characters
- [ ] Single quotes used consistently

---

## 🤝 Contributing

When contributing to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following these guidelines
4. Run tests and linting
5. Submit a pull request

---

## 📚 Additional Resources

- [Vue.js Best Practices](https://vuejs.org/guide/scaling-up/sfc-best-practices.html)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [TypeScript Style Guide](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/website)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

---

*Last updated: 2026*