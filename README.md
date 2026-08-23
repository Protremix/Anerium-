# ANERIUM OnePass

Loyalty & discount platform for local businesses. Customers discover discounts, earn loyalty rewards, and manage memberships — all in one app.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TailwindCSS |
| Backend | Node.js, Express |
| Database | PostgreSQL 16 |
| Reverse Proxy | Caddy 2 (auto HTTPS) |
| Container | Docker + Docker Compose |
| Auth | JWT + Google OAuth + TOTP 2FA |
| AI | OpenAI (optional) |

## Architecture

```
Internet → Caddy (443/TLS) → App (3001) → PostgreSQL (5432)
                              ↓
                         Docker Compose
```

- **Caddy**: TLS termination, security headers, reverse proxy
- **App**: Express server with entity CRUD, auth, monitoring routes
- **DB**: PostgreSQL with WAL archiving (PITR), tuned for 4GB RAM

## Project Structure

```
anerium-onepass/
├── src/
│   ├── app.js              # Express app, middleware, CORS, rate limiting
│   ├── auth.js             # JWT utilities
│   ├── db.js               # PostgreSQL connection pool
│   ├── openai.js           # OpenAI integration
│   ├── schema.sql          # Database schema (12 tables)
│   ├── routes/
│   │   ├── auth.js         # Login, register, OAuth, 2FA/OTP
│   │   ├── entities.js     # Generic CRUD for all entities
│   │   ├── functions.js    # Business logic (privacy, notifications, etc.)
│   │   └── monitoring.js   # Health, metrics endpoints
│   └── utils/
│       ├── entityName.js   # Entity name resolution
│       └── queryTranslator.js  # Query translation
├── scripts/
│   ├── backup.sh           # Daily backup + S3 offsite push
│   ├── health-check.sh     # 60s health monitor (cert, disk, containers)
│   ├── alert-config.sh     # Webhook config (Discord/Slack)
│   ├── restore-verify.sh   # Backup restore verification
│   └── load_test.py        # Performance load testing
├── docs/
│   ├── FAILOVER_PLAN.md    # 6-scenario recovery plan with RTO/RPO
│   └── GDPR_COMPLIANCE.md  # GDPR audit checklist
├── public/                 # Static assets, APK, policy pages
│   ├── privacy.html        # GDPR privacy policy
│   ├── terms.html          # Terms of service
│   └── assets/             # Frontend build
├── docker-compose.yml      # App + DB with PG tuning + WAL
├── Dockerfile              # Node.js 20 Alpine
├── schema.sql              # Full database schema
└── .gitignore
```

## Database Schema (12 Tables)

| Table | Purpose |
|-------|---------|
| users | User accounts (email, password_hash, 2FA, role) |
| businesses | Business listings (name, location, category) |
| discounts | Discount offers per business |
| user_memberships | Loyalty membership plans |
| transactions | Loyalty point transactions |
| reviews | Business reviews |
| support_tickets | Customer support |
| chat_messages | Support chat |
| crm_records | CRM entries |
| campaigns | Marketing campaigns |
| favorites | User favorite businesses |
| notifications | Push/email notifications |

## Security

- SSH key-only auth (password disabled)
- JWT authentication with refresh tokens
- TOTP 2FA (Google Authenticator)
- Rate limiting: 5 login attempts / 15 min
- Security headers: HSTS, CSP, X-Frame-Options, COEP, COOP, CORP
- CORS locked to anerium.com / anerium.de
- UFW firewall (only 22, 80, 443)
- PostgreSQL WAL archiving (PITR)

## Production Server

- **Provider**: Hetzner Cloud (Nuremberg, EU)
- **Specs**: 4GB RAM, 75GB disk, Ubuntu 22.04
- **Domains**: anerium.com, anerium.de
- **SSL**: Let's Encrypt via Caddy (auto-renew)
- **Uptime monitor**: 60s health check with alert delivery

## Deployment

```bash
# Clone
git clone git@github.com:Protremix/Anerium-.git
cd Anerium-

# Configure
cp .env.example .env  # Set DB_PASSWORD, JWT_SECRET, etc.

# Deploy
docker compose up -d --build

# Verify
curl https://anerium.com/health
```

## Backup & Recovery

- **Local backups**: Daily at 3am UTC (30-day retention)
- **WAL archiving**: 5-min granularity PITR
- **Offsite**: S3-compatible (Hetzner Storage Box — configure in .env)
- **Restore test**: Run `scripts/restore-verify.sh`

## Monitoring

- Health endpoint: `GET /health`
- Metrics: `GET /api/apps/:id/monitoring/metrics`
- Cert expiry alert: 30 days before
- Disk space alert: >80%
- Dead tuple alert: >1000

## Branches

| Branch | Purpose |
|--------|---------|
| master | Production stable |
| protremix | Development / design |

## License

Proprietary — ANERIUM © 2026
