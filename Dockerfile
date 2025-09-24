# Base image with tools
FROM denoland/deno:2.4.5 AS base

USER root

# Install archive extraction tools
RUN apt-get update && apt-get install -y \
    unzip \
    p7zip-full \
    && rm -rf /var/lib/apt/lists/*

# -----------------------------------------
# DEVELOPMENT STAGE
# -----------------------------------------
FROM base AS development

# Switch to deno user
USER deno

WORKDIR /app

# Copy source code as deno user
COPY --chown=deno:deno . .

# Expose dev and vite ports
EXPOSE 8000 5173

# Run dev script
CMD ["task", "dev"]

# -----------------------------------------
# PRODUCTION STAGE
# -----------------------------------------
FROM base AS production

USER deno

WORKDIR /app

# Copy source code as deno user
COPY --chown=deno:deno . .

# Expose production port
EXPOSE 8000 9229

# Run main script in production
CMD ["deno", "run", "-A", "--unstable", "src/main.ts"]
