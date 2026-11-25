# ==========================================
# Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json ./

# Install dependencies deterministically
RUN npm ci

# Copy source code
COPY . .

# Build-time environment variables for Vite SPA
ARG VITE_APP_STAGE=production
ARG VITE_API_BASE_URL_LIVE
ARG VITE_API_BASE_URL_LOCAL
ARG VITE_APP_VERSION=1.0.0

ENV VITE_APP_STAGE=${VITE_APP_STAGE}
ENV VITE_API_BASE_URL_LIVE=${VITE_API_BASE_URL_LIVE}
ENV VITE_API_BASE_URL_LOCAL=${VITE_API_BASE_URL_LOCAL}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}

# Build production bundle
RUN npm run build

# ==========================================
# Production Runtime Stage (Nginx)
# ==========================================
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
