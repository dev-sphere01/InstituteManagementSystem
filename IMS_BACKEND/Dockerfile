FROM node:20-alpine AS runner

WORKDIR /app

# Install dependencies (only production packages)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application code
COPY . .

# Create uploads and logs directories and ensure proper ownership for non-root node user
RUN mkdir -p uploads logs && chown -R node:node /app

# Run as non-root user for security
USER node

# Production environment defaults
ENV NODE_ENV=production \
    PORT=4000

EXPOSE 4000

# Health check against unauthenticated root endpoint (serves Swagger UI / API docs)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/ || exit 1

CMD ["node", "server.js"]
