FROM oven/bun:alpine AS builder
WORKDIR /app
COPY . .
RUN bun install
RUN bun build --compile ./src/main.ts --outfile bunlib.so
RUN ls -l /app
RUN ls -l /app

FROM alpine:3.20 AS runner
WORKDIR /
RUN apk add --no-cache libstdc++ libgcc
COPY --from=builder /app/bunlib.so /bunlib.so
CMD ["/bunlib.so"]