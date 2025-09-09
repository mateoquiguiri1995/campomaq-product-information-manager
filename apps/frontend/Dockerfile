# Use a specific version of Node.js for reproducibility
FROM node:22-alpine AS base

# 1. Dependencies
FROM base AS deps
WORKDIR /app

# Copy package definition files from the frontend directory
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --frozen-lockfile

# 2. Builder
FROM base AS builder
WORKDIR /app

# Accept the NEXT_PUBLIC_API_URL as a build argument
ARG NEXT_PUBLIC_API_URL
# Set it as an environment variable *for this build stage*
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all source files from the build context
COPY . .

# Build the frontend application from within its directory
RUN npm run build

# 3. Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy the standalone output from the builder stage
COPY --from=builder --chown=node:node app/.next/standalone/app ./
# Copy the public assets
# COPY --from=builder --chown=node:node /app/apps/frontend/public ./apps/frontend/public
# Copy the static assets
COPY --from=builder --chown=node:node /app/.next/static .next/static

# Use a non-root user for security
USER node

EXPOSE 3000

# Start the server; server.js is now at the root of WORKDIR
CMD ["node", "server.js", "-H", "0.0.0.0"]