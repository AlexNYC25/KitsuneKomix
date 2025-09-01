FROM denoland/deno:2.4.5

WORKDIR /app

USER deno

COPY deno.json deno.lock ./
RUN deno cache --lock=deno.lock

# Copy your source code
COPY . .

# Expose the port your Oak/Deno app will run on
EXPOSE 3000

CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--allow-ffi", "--allow-env", "main.ts"]