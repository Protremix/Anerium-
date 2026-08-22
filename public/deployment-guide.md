# ANERIUM OnePass — Deployment Guide

## Server Specs
- **Provider:** Hetzner Cloud
- **OS:** Ubuntu 22.04 LTS
- **IP:** 178.104.121.35
- **Domain:** anerium.com / anerium.de (via IONOS DNS → server IP)

## Stack
- Docker + Docker Compose
- Caddy reverse proxy (auto-HTTPS)
- PostgreSQL 16
- Node.js 20 + Express (backend API)
- Next.js / Vite (frontend SPA, served as static files)

## Directory Structure
```
/opt/anerium/
├── docker-compose.yml      # Container orchestration
├── Dockerfile              # Backend image
├── package.json            # Dependencies
├── .env                    # Environment variables (secrets)
├── src/
│   ├── app.js              # Express app — helmet, CORS, rate limiting, routes
│   ├── auth.js             # JWT, password hashing, sanitization
│   ├── db.js               # PostgreSQL connection pool
│   ├── routes/
│   │   ├── auth.js         # Auth endpoints (login, register, OAuth, password)
│   │   ├── entities.js     # CRUD for all entity types
│   │   ├── functions.js    # Custom business logic actions
│   │   └── monitoring.js   # Monitoring + alerting endpoints
│   └── utils/
│       ├── entityName.js   # Entity name ↔ table name mapping
│       └── queryTranslator.js  # JSON query → SQL WHERE clause
├── public/                 # Static frontend (Vite build output)
│   ├── index.html
│   ├── monitoring.html     # Live monitoring dashboard
│   └── API_DOCUMENTATION.md
├── scripts/
│   └── health-check.sh     # Cron health check (every minute)
└── API_DOCUMENTATION.md
```

## Initial Deployment
```bash
# 1. SSH into server
ssh root@178.104.121.35

# 2. Navigate to project
cd /opt/anerium

# 3. Configure environment
cp .env.example .env
# Edit .env with: JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DB credentials

# 4. Build and start
docker compose build
docker compose up -d

# 5. Verify
curl https://anerium.com/health
# Expected: {"status":"ok"}
```

## Updates & Redeployment
```bash
cd /opt/anerium

# Pull latest code (if using git)
# git pull origin main

# Rebuild and restart
docker compose build --no-cache app
docker compose up -d app

# Verify health
curl https://anerium.com/health
```

## Frontend Rebuild
```bash
cd /opt/anerium/frontend
npm install
npm run build
cp -r dist/* /opt/anerium/public/
docker compose restart app
```

## Caddy Configuration
File: `/etc/caddy/Caddyfile`
```
anerium.com, www.anerium.com {
    reverse_proxy localhost:3001
}

anerium.de, www.anerium.de {
    reverse_proxy localhost:3001
}
```
Caddy auto-provisions Let's Encrypt TLS certificates.

## Environment Variables (.env)
```
PORT=3001
JWT_SECRET=<random-64-char-string>
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
DB_HOST=db
DB_PORT=5432
DB_NAME=anerium
DB_USER=anerium
DB_PASSWORD=<secure-password>
```

## Google OAuth Setup
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `https://anerium.com/auth/google/callback`
   - `https://anerium.com/api/apps/6a7d630d865dd7ed11a16a3c/auth/google/callback`
4. Copy Client ID and Secret to `.env`
5. Restart: `docker compose restart app`

## DNS Configuration (IONOS)
```
A  anerium.com     → 178.104.121.35
A  www.anerium.com → 178.104.121.35
A  anerium.de      → 178.104.121.35
A  www.anerium.de  → 178.104.121.35
```

## Backup
```bash
# Database backup
docker exec anerium-db-1 pg_dump -U anerium anerium > /backups/anerium_$(date +%Y%m%d).sql

# Full backup (DB + code + config)
tar czf /backups/anerium_full_$(date +%Y%m%d).tar.gz /opt/anerium/
```

## Monitoring
- **Dashboard:** https://anerium.com/monitoring
- **Health API:** https://anerium.com/api/monitoring/health
- **Alerts API:** https://anerium.com/api/monitoring/alerts
- **Health Check Cron:** runs every minute, logs to `/var/log/anerium-health.log`
- **Alert Thresholds:** endpoint >500ms, DB query >100ms, error rate >1%
