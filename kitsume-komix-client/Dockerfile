# -----------------------------
# Base image & common setup
# -----------------------------
FROM node:22-alpine AS base
WORKDIR /app
ENV CI=true

# Install system deps only if you need them (e.g., git)
# RUN apk add --no-cache git

# Copy only manifests first for better layer caching
COPY package*.json ./

# -----------------------------
# Dependencies (cached layer)
# -----------------------------
FROM base AS deps
# Prefer reproducible installs
RUN npm ci

# -----------------------------
# Development stage (hot reload)
# -----------------------------
FROM base AS dev
ENV NODE_ENV=development
# Bring in node_modules from deps layer
COPY --from=deps /app/node_modules /app/node_modules
# Copy source AFTER deps to keep cache efficient
COPY . .

# Vite defaults to 5173; expose HMR overlay port too (sometimes 24678)
EXPOSE 5173
EXPOSE 24678

# If your dev script already sets --host, great; otherwise force it here:
CMD ["npm", "run", "dev", "--", "--host"]

# -----------------------------
# Build stage (production build)
# -----------------------------
FROM base AS build
ENV NODE_ENV=production
# Need full deps (dev deps included) to build
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN npm run build

# -----------------------------
# Production runtime (Nginx)
# -----------------------------
FROM nginx:alpine AS prod
# Optional: replace the default nginx config if you need SPA history routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
