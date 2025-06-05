#E:\learn-code\backend-pos\Dockerfile
# Stage 1: Build
FROM node:20.12.2 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install
# Stage 2: Runtime
FROM node:20.12.2-slim

WORKDIR /app

# สร้าง user และ group เพื่อไม่ให้รันเป็น root
RUN groupadd -r nodejs && \
    useradd -r -g nodejs nodejs && \
    mkdir -p /app && \
    chown -R nodejs:nodejs /app

USER nodejs

# Copy จาก builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

ENV NODE_ENV=production
EXPOSE 5000

# Add health check and init script
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["npm", "run", "dev"]