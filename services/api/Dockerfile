##### Rust build stage for honker extension ##### 
FROM rust:1.96 AS honker

WORKDIR /build
RUN git clone https://github.com/russellromney/honker && \
    cd honker && \
    cargo build --release -p honker-extension

##### Build stage for the deno imports. #####
FROM denoland/deno:debian AS deno-modules

WORKDIR /build

COPY deno.json deno.lock* ./
COPY packages/database/deno.json ./packages/database/deno.json
COPY services/api/deno.json ./services/api/deno.json

RUN deno install

##### Base Deno image with the built honker extension and deno modules. #####
FROM denoland/deno:debian AS base

COPY --from=honker /build/honker/target/release/ /honker/
COPY --from=deno-modules /deno-dir /deno-dir
COPY --from=deno-modules /build/node_modules /app/node_modules
COPY --from=deno-modules /build/deno.lock /app/deno.lock

COPY packages ./packages

FROM base AS prepped

WORKDIR /app

RUN mkdir -p /app/data/comics && \
    mkdir -p /app/data/config && \
    mkdir -p /app/data/cache 

COPY . .

FROM prepped AS test

RUN deno task test

##### Deno production app runner stage. #####
FROM prepped AS api

EXPOSE 8000
CMD ["deno", "task", "api"]

