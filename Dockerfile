FROM denoland/deno:2.4.5

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

# Expose the port your Oak/Deno app will run on
EXPOSE 3000

CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--allow-ffi", "--allow-sys", "--allow-env", "src/main.ts"]