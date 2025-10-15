# ===========================================
# Build Stage
# ===========================================
FROM node:18-alpine AS builder

ARG VITE_API_URL="https://autosocioly-api.pripod.com"
ENV VITE_API_URL=${VITE_API_URL}

WORKDIR /app

RUN apk add --no-cache python3 make g++ git bash curl

# Copy package files
COPY package.json pnpm-lock.yaml* bun.lockb* ./

# Install ALL dependencies (including devDependencies)
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --no-frozen-lockfile; \
    elif [ -f bun.lockb ]; then \
      npm install -g bun && bun install; \
    else \
      npm install --no-audit --no-fund; \
    fi

# Copy application code
COPY . .

# Run build (Vite uses VITE_API_URL from env)
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm run build; \
    elif [ -f bun.lockb ]; then \
      bun run build; \
    else \
      npm run build; \
    fi

# ===========================================
# Runtime Stage
# ===========================================
FROM node:18-alpine AS runtime

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install static server
RUN npm install -g http-server

# Copy build output
COPY --from=builder /app/dist ./dist

# Permissions
RUN chown -R appuser:appgroup /app && chmod -R 755 /app/dist

USER appuser

EXPOSE 3000

CMD ["http-server", "dist", "-p", "3000", "--cors", "--silent"]