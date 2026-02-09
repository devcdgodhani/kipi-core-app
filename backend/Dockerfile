# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies (including devDependencies for build)
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install; fi

# Copy source code
COPY . .

# Build the application
RUN yarn run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install production dependencies only
RUN if [ -f yarn.lock ]; then yarn install --production --frozen-lockfile; else npm install --only=production; fi

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
# Copy templates if they are used at runtime
COPY --from=builder /app/templates ./templates

# Set environment to production
ENV NODE_ENV=production

EXPOSE 3000

CMD ["yarn", "start"]
