# ========== Base image ==========
FROM denoland/deno:debian AS base
WORKDIR /app

USER root

# Install extra packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    p7zip-full \
    ca-certificates \
    gnupg \
    git && \
    rm -rf /var/lib/apt/lists/*

USER deno

# Copy manifest files
COPY deno.json* ./

# ========== Dependencies ==========
FROM base AS deps
# Cache dependencies (lockfile optional)
# Adjust "main.ts" if your entry is elsewhere
RUN deno cache main.ts || true

# ========== Development ==========
FROM base AS dev
WORKDIR /app

# Install dev dependencies if needed
COPY . .

# Mount volumes in compose for hot reload
EXPOSE 8000
CMD ["deno", "task", "dev"]

# ========== Builder (optional bundle step) ==========
FROM base AS builder
WORKDIR /app
COPY . .
RUN deno cache main.ts
# Example: bundle the app for smaller prod image
# RUN deno bundle main.ts build/app.bundle.js

# ========== Production ==========
FROM base AS prod
WORKDIR /app

# Copy cached deps
COPY --from=deps /deno-dir /deno-dir
ENV DENO_DIR=/deno-dir

# Copy source
COPY . .

EXPOSE 3000
CMD ["deno", "run", "--allow-net", "--allow-env", "main.ts"]
