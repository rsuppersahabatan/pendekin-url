# Stage 1: Prune
FROM oven/bun:1.2.4 AS pruner
WORKDIR /app
COPY . .
RUN bun x turbo prune server --docker

# Stage 2: Build
FROM oven/bun:1.2.4 AS builder
WORKDIR /app

# 1. Salin hasil prune
COPY --from=pruner /app/out/json/ .

# 2. FIX: Hapus referensi "./client" dari package.json agar Bun tidak mencarinya
# Serta hapus lockfile lama agar tidak terjadi konflik resolusi
RUN sed -i '/"\/client"/d' package.json && \
    sed -i '/"\.\/client"/d' package.json && \
    rm -f bun.lock bun.lockb

# 3. Install dependencies
# Sekarang Bun hanya akan melihat workspace yang benar-benar ada (server & shared)
RUN bun install --ignore-scripts

# 4. Copy source code asli
COPY --from=pruner /app/out/full/ .
COPY turbo.json tsconfig.json ./

# 5. Build
RUN bun x turbo run build --filter=server...

# Stage 3: Production
FROM oven/bun:1.2.4-slim
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
# Gunakan "find" jika Anda tidak yakin dengan lokasi dist-nya
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/package.json ./

EXPOSE 5000
CMD ["bun", "run", "server/dist/index.js"]