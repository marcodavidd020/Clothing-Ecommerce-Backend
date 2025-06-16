 # ==================================
# 🐳 Multi-Stage Docker Build
# ==================================

# ============ BASE STAGE ============
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# ============ DEPENDENCIES STAGE ============
FROM base AS deps

# Install ALL dependencies (including devDependencies)
RUN npm ci --frozen-lockfile --include=dev

# ============ BUILD STAGE ============
FROM base AS build

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma client if using Prisma (uncomment if needed)
# RUN npx prisma generate

# Build the application
RUN npm run build

# ============ PRODUCTION DEPENDENCIES STAGE ============
FROM base AS prod-deps

# Set NODE_ENV to production
ENV NODE_ENV=production

# Install only production dependencies
RUN npm ci --frozen-lockfile --only=production && npm cache clean --force

# ============ RUNTIME STAGE ============
FROM node:20-alpine AS runtime

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy built application
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./

# Copy production dependencies
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy documentation if exists
COPY --from=build --chown=nestjs:nodejs /app/documentation ./documentation 2>/dev/null || true

# Create logs directory
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]