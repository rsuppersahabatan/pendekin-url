# Multi-stage Dockerfile for Pendekin URL
# Stage 1: Build the application
FROM oven/bun:1.2.4 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock turbo.json tsconfig.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/
COPY shared/package.json ./shared/

# Copy source code BEFORE installing dependencies
# This ensures source files are available for the postinstall script
COPY server ./server
COPY client ./client
COPY shared ./shared

# Install dependencies (postinstall will run and build shared + server)
RUN bun install --frozen-lockfile

# Build the client (already built by postinstall for server/shared)
RUN bun run build:client

# Stage 2: Production image
FROM oven/bun:1.2.4-slim

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose ports
# Server runs on port 3000, client needs to be served separately
EXPOSE 3000

# Start the server
CMD ["bun", "run", "server/dist/index.js"]
