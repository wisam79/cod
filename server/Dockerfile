# Stage 1: Builder
FROM node:20-slim AS builder

# Install system dependencies (needed for compiling sqlite3 if prebuilt binaries fail)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

# Stage 2: Runner (production)
FROM node:20-slim

WORKDIR /usr/src/app

# Copy production node_modules from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY . .

EXPOSE 5000
ENV NODE_ENV=production

CMD ["node", "server.js"]
