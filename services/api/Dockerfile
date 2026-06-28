##### Rust build stage for honker extension ##### 
FROM rust:1.96 AS honker

WORKDIR /build
RUN git clone https://github.com/russellromney/honker && \
    cd honker && \
    cargo build --release -p honker-extension

##### Build stage for the Bun imports. #####
FROM oven/bun:debian AS bun-modules

WORKDIR /build

COPY package.json bun.lock* ./
COPY packages/database/package.json ./packages/database/package.json
COPY services/api/package.json ./services/api/package.json

RUN bun install

##### Base Bun image with the built honker extension and Bun modules. #####
FROM denoland/deno:debian AS base

COPY --from=honker /build/honker/target/release/ /honker/
COPY --from=bun-modules /build/node_modules /app/node_modules
COPY --from=bun-modules /build/bun.lock /app/bun.lock

COPY packages ./packages

FROM base AS prepped

WORKDIR /app

RUN mkdir -p /app/data/comics && \
    mkdir -p /app/data/config && \
    mkdir -p /app/data/cache 

COPY . .

FROM prepped AS test

RUN bun test

##### Bun production app runner stage. #####
FROM prepped AS api

EXPOSE 8000
CMD ["bun", "run", "api"]

