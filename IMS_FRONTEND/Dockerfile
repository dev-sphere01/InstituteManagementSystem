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
ARG VITE_API_BASE_URL
ARG VITE_CUPLEMS_URL
ARG VITE_API_TIMEOUT
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_REDIRECT_URI
ARG VITE_APP_STAGE=production
ARG VITE_API_BASE_URL_LIVE
ARG VITE_API_BASE_URL_LOCAL

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_CUPLEMS_URL=${VITE_CUPLEMS_URL}
ENV VITE_API_TIMEOUT=${VITE_API_TIMEOUT}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_GOOGLE_REDIRECT_URI=${VITE_GOOGLE_REDIRECT_URI}
ENV VITE_APP_STAGE=${VITE_APP_STAGE}
ENV VITE_API_BASE_URL_LIVE=${VITE_API_BASE_URL_LIVE}
ENV VITE_API_BASE_URL_LOCAL=${VITE_API_BASE_URL_LOCAL}

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
