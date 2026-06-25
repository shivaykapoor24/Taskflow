# Dockerfile — for the Node.js backend
# Build: docker build -t taskflow-api .
# Run:   docker run -p 5000:5000 --env-file .env taskflow-api

FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000
CMD ["node", "server.js"]
