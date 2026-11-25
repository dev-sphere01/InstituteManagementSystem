FROM node:20-alpine AS runner

WORKDIR /app

# Install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY . .

# Run as non-root user
USER node

ENV NODE_ENV=production

EXPOSE 5000

# Health check against root status endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/ || exit 1

CMD ["node", "server.js"]
