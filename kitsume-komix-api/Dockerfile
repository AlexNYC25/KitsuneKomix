# ========== Base image ==========
FROM denoland/deno:debian AS base
WORKDIR /app

USER root

# Install extra packages including gosu for user switching
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    p7zip-full \
    ca-certificates \
    gnupg \
    git \
    gosu && \
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

# Create necessary directories and set permissions
USER root
RUN mkdir -p /app/node_modules /app/cache /app/comics /app/config && \
    chown -R deno:deno /app

# Copy entrypoint script
COPY --chown=root:root docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER deno

# Install dev dependencies if needed
COPY --chown=deno:deno . .

# Mount volumes in compose for hot reload
EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
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
CMD ["deno", "run", "--allow-run=unzip,7z,7za", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "--allow-ffi", "--allow-sys", "main.ts"]
