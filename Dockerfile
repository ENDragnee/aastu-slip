# --- BASE STAGE ---
FROM node:25-alpine AS base

# 1. Install system libs
RUN apk add --no-cache openssl libc6-compat

# 2. Install Corepack with --force to overwrite existing yarn/pnpm binaries
# Then enable it to handle the packageManager field
RUN npm install -g corepack@latest --force && corepack enable

WORKDIR /app

# --- BUILDER STAGE ---
FROM base AS builder
# Copy only lockfile and package.json for better caching
COPY package.json pnpm-lock.yaml ./

# Ensure the specific pnpm version from package.json is prepared and installed
RUN corepack prepare --activate && pnpm install --no-frozen-lockfile

# Copy ALL source files
COPY . .

ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ARG NEXTAUTH_SECRET="dummy_secret_for_build_only"

ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NODE_ENV=production

# Generate Prisma Client & Build
RUN pnpm prisma generate
RUN pnpm build

# --- RUNNER STAGE ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create Non-root User
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

COPY package.json pnpm-lock.yaml ./

# 3. Use Corepack for Production Install
# We need 'tsx' and 'prisma' for your custom config setup
RUN corepack prepare --activate && \
  pnpm install --prod --no-frozen-lockfile && \
  pnpm add -D tsx dotenv prisma

# Copy Next.js Build (Standalone)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 4. Copy Prisma Assets & Config
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

# Next.js standalone server
CMD ["sh", "-c", "pnpm prisma db push && node server.js"]
