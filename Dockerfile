# Stage 1: Build
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN bun run build

# Stage 2: Production
FROM oven/bun:1-slim

WORKDIR /app

# Copy package files and lock for migrations
COPY --from=builder /app/package.json /app/bun.lock ./

# Copy node_modules from builder (includes drizzle-kit)
COPY --from=builder /app/node_modules ./node_modules

# Copy drizzle config
COPY --from=builder /app/drizzle.config.ts ./

# Copy migration files
COPY --from=builder /app/server/db/migrations ./server/db/migrations

# Copy built application
COPY --from=builder /app/.output /app/.output

# Copy and set permissions for entrypoint
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Run the application with migrations
CMD ["./entrypoint.sh"]
