# AutoSocioly Frontend Multi-Stage Docker Build
# Optimized for production with security hardening and performance optimizations

# Builder stage - Install dependencies and build the application
FROM node:18-alpine as builder

# Set build arguments
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION=1.0.0
ARG NODE_ENV=production

# Set metadata
LABEL maintainer="AutoSocioly Team <contact@autosocioly.com>" \
      org.opencontainers.image.title="AutoSocioly Frontend" \
      org.opencontainers.image.description="React frontend for AI-powered social media automation platform" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.source="https://github.com/your-username/AutoSocioly" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.vendor="AutoSocioly" \
      org.opencontainers.image.url="https://autosocioly.com" \
      org.opencontainers.image.documentation="https://docs.autosocioly.com" \
      org.opencontainers.image.authors="AutoSocioly Development Team"

# Set environment variables
ENV NODE_ENV=${NODE_ENV} \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# Create app directory
WORKDIR /app

# Install system dependencies for building native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    bash

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY bun.lockb* ./

# Install dependencies based on available lock files
RUN if [ -f pnpm-lock.yaml ]; then \
        npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f bun.lockb ]; then \
        npm install -g bun && bun install --frozen-lockfile; \
    else \
        npm ci --only=production --no-audit --no-fund; \
    fi

# Copy source code
COPY . .

# Build the application
RUN if [ -f pnpm-lock.yaml ]; then \
        pnpm run build; \
    elif [ -f bun.lockb ]; then \
        bun run build; \
    else \
        npm run build; \
    fi

# Production stage - Serve the built application with Nginx
FROM nginx:alpine as production

# Set build arguments
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION=1.0.0

# Set metadata (same as builder stage)
LABEL maintainer="AutoSocioly Team <contact@autosocioly.com>" \
      org.opencontainers.image.title="AutoSocioly Frontend" \
      org.opencontainers.image.description="React frontend for AI-powered social media automation platform" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.source="https://github.com/your-username/AutoSocioly" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.vendor="AutoSocioly" \
      org.opencontainers.image.url="https://autosocioly.com" \
      org.opencontainers.image.documentation="https://docs.autosocioly.com" \
      org.opencontainers.image.authors="AutoSocioly Development Team"

# Set environment variables
ENV NGINX_USER=nginx \
    NGINX_GROUP=nginx \
    NGINX_WORKER_PROCESSES=auto \
    NGINX_WORKER_CONNECTIONS=1024 \
    NGINX_SENDFILE=on \
    NGINX_TCP_NOPUSH=on \
    NGINX_TCP_NODELAY=on \
    NGINX_KEEPALIVE_TIMEOUT=65 \
    NGINX_TYPES_HASH_MAX_SIZE=2048 \
    NGINX_CLIENT_MAX_BODY_SIZE=16M

# Install additional packages for security and performance
RUN apk add --no-cache \
    curl \
    tzdata \
    ca-certificates \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create nginx user and group
RUN addgroup -g 101 -S ${NGINX_GROUP} && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G ${NGINX_GROUP} -g ${NGINX_GROUP} ${NGINX_USER}

# Create necessary directories
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    /var/log/nginx \
    /etc/nginx/conf.d \
    /etc/nginx/sites-available \
    /etc/nginx/sites-enabled

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Set proper permissions
RUN chown -R ${NGINX_USER}:${NGINX_GROUP} /usr/share/nginx/html \
    /var/cache/nginx \
    /var/log/nginx \
    /etc/nginx/conf.d \
    && chmod -R 755 /usr/share/nginx/html

# Create a non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G appgroup -g appgroup appuser

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx with dumb-init for proper signal handling
CMD ["dumb-init", "nginx", "-g", "daemon off;"]

# Development stage - Includes development tools and hot reload
FROM node:18-alpine as development

# Set build arguments
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION=1.0.0

# Set metadata
LABEL maintainer="AutoSocioly Team <contact@autosocioly.com>" \
      org.opencontainers.image.title="AutoSocioly Frontend Development" \
      org.opencontainers.image.description="Development environment for React frontend" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.source="https://github.com/your-username/AutoSocioly" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.vendor="AutoSocioly" \
      org.opencontainers.image.url="https://autosocioly.com" \
      org.opencontainers.image.documentation="https://docs.autosocioly.com" \
      org.opencontainers.image.authors="AutoSocioly Development Team"

# Set environment variables
ENV NODE_ENV=development \
    NPM_CONFIG_LOGLEVEL=info \
    VITE_API_URL=http://localhost:8000

# Create app directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    bash

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY bun.lockb* ./

# Install all dependencies (including dev dependencies)
RUN if [ -f pnpm-lock.yaml ]; then \
        npm install -g pnpm && pnpm install; \
    elif [ -f bun.lockb ]; then \
        npm install -g bun && bun install; \
    else \
        npm install; \
    fi

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -D -H -u 1001 -h /app -s /bin/bash -G appgroup -g appgroup appuser

# Change ownership of app directory
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5173/ || exit 1

# Start development server
CMD if [ -f pnpm-lock.yaml ]; then \
        pnpm run dev --host 0.0.0.0; \
    elif [ -f bun.lockb ]; then \
        bun run dev --host 0.0.0.0; \
    else \
        npm run dev -- --host 0.0.0.0; \
    fi

# Testing stage - Includes testing frameworks and tools
FROM development as testing

# Switch to root for testing dependencies
USER root

# Install testing tools
RUN if [ -f pnpm-lock.yaml ]; then \
        pnpm add -D @testing-library/react @testing-library/jest-dom vitest jsdom; \
    elif [ -f bun.lockb ]; then \
        bun add -D @testing-library/react @testing-library/jest-dom vitest jsdom; \
    else \
        npm install -D @testing-library/react @testing-library/jest-dom vitest jsdom; \
    fi

# Switch back to app user
USER appuser

# Default command for testing
CMD if [ -f pnpm-lock.yaml ]; then \
        pnpm run test; \
    elif [ -f bun.lockb ]; then \
        bun run test; \
    else \
        npm run test; \
    fi

# Build stage - For CI/CD builds
FROM builder as build

# Set build environment
ENV BUILD_ENV=production

# Run security checks and linting
RUN if [ -f pnpm-lock.yaml ]; then \
        pnpm run lint; \
    elif [ -f bun.lockb ]; then \
        bun run lint; \
    else \
        npm run lint; \
    fi

# Run type checking
RUN if [ -f pnpm-lock.yaml ]; then \
        pnpm run type-check || true; \
    elif [ -f bun.lockb ]; then \
        bun run type-check || true; \
    else \
        npm run type-check || true; \
    fi

# Final stage for multi-architecture builds
FROM production as final

# Set final metadata
LABEL org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.version="${VERSION}"

# Default command with dumb-init
CMD ["dumb-init", "nginx", "-g", "daemon off;"]
