# ANERIUM OnePass — Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Internet                          │
│                  (anerium.com)                        │
└──────────────────┬──────────────────────────────────┘
                   │
         ┌─────────▼─────────┐
         │   Caddy (443/80)   │  ← TLS termination, reverse proxy
         │   Auto-HTTPS       │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │  Node.js App      │  ← Express.js server (port 3001)
         │  (anerium-app-1)  │
         │                   │
         │  • Auth routes    │
         │  • Entity CRUD    │
         │  • Functions      │
         │  • Monitoring     │
         │  • Static files   │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │  PostgreSQL 16     │  ← Database (port 5432)
         │  (anerium-db-1)    │
         │                   │
         │  24 tables         │
         │  210+ records      │
         │  118 indexes       │
         │  44 FK constraints │
         └───────────────────┘
```

## Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Reverse Proxy | Caddy | 2.x |
| Runtime | Node.js | 20 LTS |
| Framework | Express.js | 4.x |
| Database | PostgreSQL | 16 |
| ORM/Query | node-postgres (pg) | 8.x |
| Auth | JWT (jsonwebtoken) | 9.x |
| Security | helmet, cors, express-rate-limit | 7.x / 2.8 / 7.x |
| Frontend | React + Vite (SPA) | 18 / 5 |
| Container | Docker Compose | 24/2.24 |
| Server | Hetzner Cloud | CX22 (2 vCPU, 4GB) |
| OS | Ubuntu 22.04 LTS | |

## Server Details

- **IP:** 178.104.121.35
- **Location:** Hetzner Cloud (Falkenstein, DE)
- **DNS:** anerium.com, www.anerium.com, anerium.de, www.anerium.de → 178.104.121.35
- **TLS:** Caddy auto-HTTPS with Let's Encrypt

## Directory Structure

```
/opt/anerium/
├── docker-compose.yml       # Container orchestration
├── package.json             # Node dependencies
├── .env                     # Environment variables (secrets)
├── Caddyfile                # Reverse proxy config
├── public/                  # Built frontend (Vite output)
│   ├── index.html           # SPA entry point
│   ├── monitoring.html      # Monitoring dashboard
│   └── API_DOCUMENTATION.md # API reference
├── src/
│   ├── app.js               # Express app entry point
│   ├── db.js                # PostgreSQL connection pool
│   ├── auth.js              # JWT, password hashing, sanitization
│   ├── routes/
│   │   ├── auth.js          # Auth endpoints (login, register, Google OAuth)
│   │   ├── entities.js      # Entity CRUD endpoints
│   │   ├── functions.js     # Custom business logic functions
│   │   └── monitoring.js    # Monitoring dashboard + alerting
│   └── utils/
│       ├── entityName.js   # Entity/table name transforms
│       └── queryTranslator.js # Query filter translation
├── scripts/
│   └── health-check.sh      # Automated health check (cron)
└── logs/                    # Health check logs
    ├── health-check.log
    └── alerts.log
```

## Environment Variables (.env)

```bash
# Database
POSTGRES_USER=anerium
POSTGRES_PASSWORD=<secret>
POSTGRES_DB=anerium
DATABASE_URL=postgresql://anerium:<secret>@db:5432/anerium

# JWT
JWT_SECRET=<secret>

# Google OAuth
GOOGLE_CLIENT_ID=<secret>
GOOGLE_CLIENT_SECRET=<secret>

# Server
PORT=3001
NODE_ENV=production
```

## Deployment Steps

### Fresh Install

1. **Provision server** (Hetzner CX22 or equivalent):
   ```bash
   apt update && apt upgrade -y
   apt install -y docker.io docker-compose-plugin caddy
   ```

2. **Clone project**:
   ```bash
   git clone <repo> /opt/anerium
   cd /opt/anerium
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   nano .env  # Set all secrets
   ```

4. **Configure Caddy**:
   ```bash
   cat > /etc/caddy/Caddyfile << 'EOF'
   anerium.com, www.anerium.com {
       reverse_proxy localhost:3001
   }
   anerium.de, www.anerium.de {
       reverse_proxy localhost:3001
   }
   EOF
   systemctl restart caddy
   ```

5. **Build and start**:
   ```bash
   docker compose build
   docker compose up -d
   ```

6. **Verify**:
   ```bash
   curl https://anerium.com/health
   # Expected: {"status":"ok"}
   ```

7. **Install health check cron**:
   ```bash
   chmod +x /opt/anerium/scripts/health-check.sh
   (crontab -l 2>/dev/null; echo "* * * * * /opt/anerium/scripts/health-check.sh") | crontab -
   ```

### Updating Existing Deployment

```bash
cd /opt/anerium
git pull origin main
docker compose build --no-cache app
docker compose up -d app
curl https://anerium.com/health
```

### Database Backup

```bash
# Manual backup
docker exec anerium-db-1 pg_dump -U anerium anerium > backup_$(date +%Y%m%d).sql

# Restore
cat backup_YYYYMMDD.sql | docker exec -i anerium-db-1 psql -U anerium -d anerium
```

## Monitoring

- **Dashboard:** `https://anerium.com/monitoring` (real-time, auto-refresh 5s)
- **API:** `https://anerium.com/api/monitoring/health` (JSON)
- **Alerts:** `https://anerium.com/api/monitoring/alerts` (JSON)
- **Health Check:** Runs every minute via cron, logs to `/opt/anerium/logs/`
- **Alert Thresholds:**
  - Endpoint response >500ms → warning
  - DB query >100ms → warning
  - Error rate >1% → critical

## Security

- **CORS:** Locked to anerium.com, anerium.de, www variants, localhost
- **Rate Limiting:** Auth 100/min per IP, API 1000/min per user
- **Security Headers:** HSTS, CSP, X-Frame-Options, X-Content-Type-Options (helmet)
- **Input Sanitization:** Script tags, HTML tags, javascript: URIs stripped
- **Password Storage:** bcrypt hashing, never returned in API responses
- **SQL Injection:** All queries parameterized ($1, $2, ...)
- **JWT:** Signed with secret, revocable, none-algorithm rejected

## Troubleshooting

| Issue | Check |
|-------|-------|
| 502 Bad Gateway | `docker ps` — is app running? `docker logs anerium-app-1` |
| SSL errors | `systemctl status caddy` — check Caddy logs |
| DB connection | `docker logs anerium-db-1` — check PostgreSQL |
| Slow responses | `https://anerium.com/monitoring` — check dashboard |
| Auth failures | Check JWT_SECRET in .env, verify token format |

## Emergency Contacts

- **Server:** Hetzner Cloud Console
- **DNS:** IONOS
- **Google OAuth:** Google Cloud Console
