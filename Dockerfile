FROM denoland/deno:2.4.5

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

# Copy source code
COPY . .

# Change ownership to deno user
RUN chown -R deno:deno /app

USER deno

# Cache dependencies
RUN deno cache --lock=deno.lock src/main.ts

# Expose the port your Deno app will run on
EXPOSE 3000

CMD ["run", "--allow-env", "--allow-read", "--allow-net", "--allow-write", "--allow-ffi", "--allow-sys", "--allow-run", "src/main.ts"]