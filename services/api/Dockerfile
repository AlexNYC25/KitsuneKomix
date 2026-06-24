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

RUN deno install

##### Base Deno image with the built honker extension and deno modules. #####
FROM denoland/deno:debian AS base

COPY --from=honker /build/honker/target/release/ /honker/
COPY --from=deno-modules /deno-dir /deno-dir

COPY packages ./packages


##### Deno production app runner stage. #####
FROM base AS api

WORKDIR /app

RUN mkdir -p /app/data/comics && \
    mkdir -p /app/data/config && \
    mkdir -p /app/data/cache 

COPY . .

EXPOSE 8000
CMD ["deno", "task", "api"]

