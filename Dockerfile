# --- BASE STAGE ---
FROM node:22-alpine AS base

# 1. Install system libs required by Prisma and Node
RUN apk add --no-cache openssl libc6-compat

# 2. Install PNPM globally via npm (Bypasses Corepack network checks)
RUN npm install -g pnpm@latest

WORKDIR /app

# --- DEPS STAGE ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./

# Install dependencies strictly from the lockfile
RUN pnpm install --no-frozen-lockfile

# --- BUILDER STAGE ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy secrets for build time only (Next.js requires them to compile)
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ARG NEXTAUTH_SECRET="dummy_secret_for_build_only"

ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NODE_ENV=production

# 1. Generate Prisma Client
RUN pnpm prisma generate

# 2. Build Next.js App
RUN pnpm build

# 3. Build Background Worker (Compiles TS to JS in /dist)
RUN pnpm worker:build

# --- RUNNER STAGE ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create Non-root User for security
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Copy Production Dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --no-frozen-lockfile

# 1. Copy Next.js Standalone Build
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 2. Copy Compiled Worker
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# 3. Copy Prisma Assets (Required for the Prisma Client at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
