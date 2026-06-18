# ========== Base image ==========
FROM denoland/deno:debian AS base
WORKDIR /app

# Install runtime utilities (gosu for user switching in entrypoint)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    p7zip-full \
    ca-certificates \
    gnupg \
    git \
    gosu \
    && rm -rf /var/lib/apt/lists/*

# Copy manifest files
COPY deno.json* ./

# ========== Dependencies ==========
FROM base AS deps

ENV DENO_DIR=/deno-dir
RUN deno cache main.ts

# ========== Development ==========
FROM base AS dev

# Create writable directories and fix ownership
RUN mkdir -p /app/node_modules /app/cache /app/comics /app/config && \
    chown -R deno:deno /app

# Copy entrypoint script
COPY --chown=root:root docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy source
COPY --chown=deno:deno . .

EXPOSE 8001
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["deno", "task", "dev"]

# ========== Production ==========
FROM base AS prod

# Pull cached dependencies from deps stage
ENV DENO_DIR=/deno-dir
COPY --from=deps /deno-dir /deno-dir

# Copy source
COPY . .

EXPOSE 8001
CMD ["deno", "task", "start"]
