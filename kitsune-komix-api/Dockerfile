##### Rust build stage for honker extension ##### 
FROM rust:1.96 AS honker

WORKDIR /build
RUN git clone https://github.com/russellromney/honker && \
    cd honker && \
    cargo build --release -p honker-extension

##### Build stage for the deno imports. #####
FROM denoland/deno:alpine AS deno-modules

WORKDIR /build

COPY deno.json deno.lock* ./
COPY . .

RUN deno cache ./main.ts

##### Base Deno image #####
FROM denoland/deno:debian AS base

WORKDIR /app

COPY --from=honker /build/honker/target/release/libhonker_ext.so /app/
COPY --from=deno-modules /build/node_modules /app/node_modules

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    p7zip-full \
    ca-certificates \
    gnupg \
    git \
    gosu \
    && rm -rf /var/lib/apt/lists/*

##### Deno production app runner stage. #####
FROM base AS production

WORKDIR /app
COPY . .

EXPOSE 8001
CMD ["deno", "task", "start"]

##### Deno development app runner stage. #####
FROM base AS development

WORKDIR /app

RUN mkdir -p /app/comics && \
    mkdir -p /app/config && \
    mkdir -p /app/cache 

COPY . .

EXPOSE 8001
CMD ["deno", "task", "dev"]

