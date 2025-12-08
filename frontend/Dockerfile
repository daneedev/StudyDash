# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
COPY .env .env
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.ts ./vite.config.ts

CMD ["npm", "run", "preview"]