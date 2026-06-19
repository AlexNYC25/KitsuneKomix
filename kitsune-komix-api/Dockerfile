FROM rust:1.96-alpine AS honker

WORKDIR /build
RUN git clone https://github.com/russellromney/honker && \
    cd honker && \
    cargo build --release -p honker-extension




