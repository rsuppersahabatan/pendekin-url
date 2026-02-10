# Stage 1: Build the client
FROM oven/bun:1.2.4 AS builder

WORKDIR /app

# Copy workspace root files
COPY package.json bun.lock turbo.json tsconfig.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/
COPY shared/package.json ./shared/

# Copy source code
COPY server ./server
COPY client ./client
COPY shared ./shared

# Install dependencies and build
RUN bun install --frozen-lockfile
RUN bun run build:client

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
