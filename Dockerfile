# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package descriptors
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies and build client
COPY . .
RUN npm run postinstall

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy only built client files and server source with its node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist

# Expose Hugging Face Space port
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
