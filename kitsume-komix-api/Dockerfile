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

# ========== Rust toolchain (for native deps) ==========
FROM base AS rust-base

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# ========== Honker extension (native build) ========== # → target/release/libhonker_ext.{dylib,so}
FROM rust-base AS honker

WORKDIR /build
RUN git clone https://github.com/russellromney/honker && \
    cd honker && \
    cargo build --release -p honker-extension

# ========== Dependencies ==========
FROM rust-base AS deps

ENV DENO_DIR=/deno-dir
RUN deno cache main.ts

# ========== Development ==========
FROM rust-base AS dev

# Create writable directories and fix ownership
RUN mkdir -p /app/node_modules /app/cache /app/comics /app/config && \
    chown -R deno:deno /app

# Copy honker binary
COPY --from=honker /build/honker/target/release/honker-extension /usr/local/bin/

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

# Copy honker binary
COPY --from=honker /build/honker/target/release/honker-extension /usr/local/bin/

# Copy source
COPY . .

EXPOSE 8001
CMD ["deno", "task", "start"]
