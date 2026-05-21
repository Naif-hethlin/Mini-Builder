# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# Multi-stage Next.js 16 production image (standalone output)
#
# Stage 1 (deps):    install ONLY package deps so they can be cached
# Stage 2 (builder): build the Next.js app
# Stage 3 (runner):  copy the standalone output into a tiny runtime image
# ---------------------------------------------------------------------------

ARG NODE_VERSION=22-alpine

# --- Stage 1: dependencies ---
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
# Copy only the package manifest first — this layer is cached unless
# package.json or package-lock.json changes.
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# --- Stage 2: build ---
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Stage 3: runtime ---
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as an unprivileged user — defense in depth.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Public assets (image library will live here).
COPY --from=builder /app/public ./public

# Standalone server bundle (Next.js puts a minimal server.js + node_modules
# here based on the `output: "standalone"` config).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
