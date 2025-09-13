FROM denoland/deno:2.4.5 AS base

# Switch to root to install packages
USER root

# Install archive extraction tools
RUN apt-get update && apt-get install -y \
    unzip \
    p7zip-full \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy configuration files first
COPY deno.json deno.lock ./

# Development stage
FROM base AS development
# Copy source code (will be overridden by volume mount in dev)
COPY src ./src
# Copy drizzle migrations (essential for database)
COPY drizzle ./drizzle
COPY drizzle.config.ts ./
# Change ownership to deno user
RUN chown -R deno:deno /app
USER deno
# Cache dependencies
RUN deno cache --lock=deno.lock src/main.ts
# Expose ports
EXPOSE 8000 9229
# Development command with hot reloading
CMD ["task", "dev"]

# Production stage
FROM base AS production
# Copy all source code for production
COPY . .
# Change ownership to deno user
RUN chown -R deno:deno /app
USER deno
# Cache dependencies
RUN deno cache --lock=deno.lock src/main.ts
# Expose only the app port
EXPOSE 8000
# Production command
CMD ["task", "start"]

# Default to production
FROM production