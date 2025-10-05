#!/bin/sh
set -e

# Fix permissions for node_modules and other directories
chown -R deno:deno /app/node_modules 2>/dev/null || true
chown -R deno:deno /app/cache 2>/dev/null || true
chown -R deno:deno /app/comics 2>/dev/null || true
chown -R deno:deno /app/config 2>/dev/null || true

# Switch to deno user and execute the command
exec su-exec deno "$@"
