# Production Deployment Runbook: Institute Management System

This runbook documents the deployment, security hardening, network isolation, database access, and operational runbook for running the **Institute Management System (IMS)** on an **AWS EC2 Ubuntu (~908 MB RAM / 30 GB SSD)** instance using Docker and Docker Compose.

---

## 1. Container Architecture & Port Security

All published application ports are bound strictly to the **host loopback interface (`127.0.0.1`)**. This guarantees that the host Nginx reverse proxy is the **only public ingress point** (handling ports 80 and 443 with SSL). No container ports or database ports are exposed directly to the public internet.

| Service | Container Name | Runtime Base | Internal Port | Host Port Binding | Health Check Endpoint | Health Executable |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ims-frontend` | `ims-frontend` | `nginx:1.27-alpine` | `80` | `127.0.0.1:3000` | HTTP GET `/` (Status 200) | `wget` (built-in Alpine) |
| `ims-backend` | `ims-backend` | `node:20-alpine` | `4000` | `127.0.0.1:4000` | HTTP GET `/` (Status 200, Swagger docs) | `wget` (built-in Alpine) |
| `ems-api` | `ems-api` | `dotnet/aspnet:8.0` | `5001` | `127.0.0.1:5001` | HTTP GET `/api/Locations` (Status 200) | `curl` (installed in image) |
| `ems-nodeapi` | `ems-nodeapi` | `node:20-alpine` | `5000` | `127.0.0.1:5002` | HTTP GET `/` (Status 200, root status) | `wget` (built-in Alpine) |
| `ems-ui` | `ems-ui` | `nginx:1.27-alpine` | `80` | `127.0.0.1:3001` | HTTP GET `/` (Status 200) | `wget` (built-in Alpine) |

---

## 2. Low-Memory EC2 Hardening (~908 MB RAM)

> [!WARNING]
> The current EC2 instance has approximately 908 MB of physical RAM. Running native MongoDB, native MySQL, and 5 containers simultaneously without swap space will cause Linux Out-Of-Memory (OOM) crashes.

### Step 2.1: Configure a 3 GB Swap File (Mandatory)
Execute on the EC2 instance to grant virtual memory headroom on your 30 GB SSD:
```bash
sudo fallocate -l 3G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
Verify swap is active:
```bash
free -h
```

### Step 2.2: Build on GitHub Actions (Do NOT Build on EC2)
Do NOT compile Docker images on the 908 MB EC2 instance (`docker compose build` will exhaust RAM during Vite and .NET compiles). Build images on GitHub Actions runners (7 GB RAM) and push to GitHub Container Registry (`ghcr.io`), then pull pre-built images to the EC2 server.

---

## 3. Database Security & Safe Host Connectivity

MongoDB and MySQL run natively on the EC2 host. Containers connect via `host.docker.internal` (`extra_hosts: ["host.docker.internal:host-gateway"]`), which resolves to the Docker bridge IP (typically `172.17.0.1`).

### Step 3.1: Dedicated Least-Privilege MySQL User (NEVER Use `root`)
Do NOT use the `root` MySQL user for application connections. On the EC2 host, log into MySQL:
```bash
sudo mysql -u root -p
```
Create a dedicated application user restricted strictly to the Docker subnet (`172.17.%.%`) and the `IMS` database:
```sql
CREATE USER 'ims_app'@'172.17.%.%' IDENTIFIED BY 'YOUR_STRONG_PASSWORD_HERE';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON IMS.* TO 'ims_app'@'172.17.%.%';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3.2: Safe MySQL Bind Address (Prevent Public Exposure)
Do NOT expose MySQL publicly. Configure MySQL to listen only on host localhost and the Docker bridge:
In `/etc/mysql/mysql.conf.d/mysqld.cnf`:
```ini
bind-address = 127.0.0.1,172.17.0.1
```
*(MySQL 8.0.13+ supports comma-separated bind addresses. This binds MySQL to the local host and the Docker bridge interface without opening it on the public network interface).*

If your MySQL version does not support multiple bind addresses:
```ini
bind-address = 0.0.0.0
```
**CRITICAL:** If `0.0.0.0` is used, verify that AWS EC2 Security Groups and `ufw` block all external access to port 3306!
Restart MySQL:
```bash
sudo systemctl restart mysql
```

---

## 4. Production URL Configuration & Build Arguments

Vite applications embed `import.meta.env.*` variables statically into JavaScript bundles during `npm run build`. They **cannot** be altered at runtime via `docker run -e` or `.env` without rebuilding the image.

To prevent broken production builds caused by accidental fallback to `localhost`, all production URLs must be explicitly passed at build time.

### GitHub Actions Build Arguments:
```bash
# IMS Frontend
docker build \
  --build-arg VITE_APP_STAGE="production" \
  --build-arg VITE_API_BASE_URL="https://ims.yourdomain.com/api/v1" \
  --build-arg VITE_CUPLEMS_URL="https://ems.yourdomain.com" \
  --build-arg VITE_API_BASE_URL_LIVE="https://ims.yourdomain.com/api/v1" \
  -t ghcr.io/dev-sphere01/ims-frontend:latest ./IMS_FRONTEND

# EMS UI
docker build \
  --build-arg VITE_APP_STAGE="production" \
  --build-arg VITE_API_BASE_URL_LIVE="https://ems.yourdomain.com" \
  --build-arg VITE_APP_VERSION="1.0.0" \
  -t ghcr.io/dev-sphere01/ems-ui:latest ./EMS/ui
```

---

## 5. Host Nginx Reverse Proxy Configuration

Host Nginx terminates SSL (via Let's Encrypt / Certbot) and proxies traffic to the internal loopback ports:

`/etc/nginx/sites-available/ims`:
```nginx
# IMS Frontend & API
server {
    listen 80;
    server_name ims.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# EMS UI & API
server {
    listen 80;
    server_name ems.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 6. Deployment Commands

```bash
cd deployment

# 1. Configure production environment
cp .env.example .env
nano .env

# 2. Start all containers in detached mode
docker compose up -d

# 3. Check container health and memory usage
docker compose ps
docker stats --no-stream
```
