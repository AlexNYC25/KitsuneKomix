# -----------------------------
# Base stage
# -----------------------------
FROM node:22-alpine AS base
WORKDIR /app

# Suppress pnpm prompts in CI/Docker context
ENV CI=true

RUN npm install -g pnpm

# Copy manifests first for layer caching
COPY package.json pnpm-lock.yaml ./

# -----------------------------
# Dependencies
# -----------------------------
FROM base AS deps
RUN pnpm install --frozen-lockfile

# -----------------------------
# Development (hot reload)
# -----------------------------
FROM base AS dev
ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5173
CMD ["pnpm", "run", "dev"]

# -----------------------------
# Build (production bundle)
# -----------------------------
FROM base AS build
ENV NODE_ENV=production

COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN pnpm run build

# -----------------------------
# Production runtime (nginx)
# -----------------------------
FROM nginx:alpine AS prod

COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback: serve index.html for all non-file routes
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
