<div align="center">

# 🏪 ANERIUM OnePass

### Loyalty & Discount Platform for Local Businesses

<p>
  <img src="https://img.shields.io/badge/Status-Production%20Ready-10b981?style=for-the-badge" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" />
</p>
<p>
  <img src="https://img.shields.io/badge/GDPR-Compliant-003399?style=for-the-badge" />
  <img src="https://img.shields.io/badge/SSL-Let%27s%20Encrypt-003366?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Response-26ms-10b981?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Hosting-Hetzner%20EU-d2492a?style=for-the-badge" />
</p>

<p>
  <a href="https://anerium.com"><b>🌐 Live Site</b></a> •
  <a href="https://anerium.com/privacy"><b>📋 Privacy</b></a> •
  <a href="https://anerium.com/terms"><b>📄 Terms</b></a> •
  <a href="docs/FAILOVER_PLAN.md"><b>🔄 Failover</b></a> •
  <a href="docs/GDPR_COMPLIANCE.md"><b>🇪🇺 GDPR</b></a>
</p>

---

</div>

## 📖 Overview

ANERIUM OnePass is a full-stack loyalty and discount platform that helps local businesses attract and retain customers. Businesses list themselves, create discounts, run loyalty programs, and manage customer relationships — all through a single, fast, GDPR-compliant web app.

## 🏗️ Architecture

```
                    ┌──────────────────────────────────────────┐
                    │              Hetzner Cloud (EU)           │
                    │              Nuremberg, Germany          │
                    │                                          │
   Internet ──────► │  Caddy 2 (TLS, headers, reverse proxy)   │
   anerium.com      │    │                                    │
   anerium.de       │    ▼                                    │
                    │  Docker Compose                          │
                    │    ├── App (Node.js/Express :3001)       │
                    │    │     ├── JWT Auth + Google OAuth     │
                    │    │     ├── TOTP 2FA                    │
                    │    │     ├── Rate Limiting               │
                    │    │     ├── Entity CRUD (12 tables)     │
                    │    │     └── Monitoring + Health         │
                    │    │                                    │
                    │    └── PostgreSQL 16 (:5432)             │
                    │          ├── WAL Archiving (PITR)       │
                    │          ├── Tuned (1GB shared_buffers)  │
                    │          └── 12 entity tables           │
                    │                                          │
                    │  Cron: Health checks (60s) + Backups (3am)│
                    └──────────────────────────────────────────┘
```

## ⚡ Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Frontend** | Next.js, React, TailwindCSS | 15 / 19 / 4 |
| **Backend** | Node.js, Express | 20 / 4 |
| **Database** | PostgreSQL | 16 |
| **Reverse Proxy** | Caddy 2 (auto HTTPS) | 2.8 |
| **Container** | Docker + Docker Compose | 24+ |
| **Auth** | JWT + Google OAuth + TOTP 2FA | — |
| **AI** | OpenAI (optional) | — |
| **OS** | Ubuntu Server | 22.04 LTS |

## 📂 Project Structure

```
Anerium-/
│
├── src/                        # Backend source
│   ├── app.js                  # Express app, middleware, CORS, rate limit
│   ├── auth.js                 # JWT utilities
│   ├── db.js                   # PostgreSQL connection pool
│   ├── openai.js               # OpenAI integration
│   ├── schema.sql              # Full database schema
│   ├── routes/
│   │   ├── auth.js             # Login, register, OAuth, 2FA/OTP
│   │   ├── entities.js         # Generic CRUD for all 12 entities
│   │   ├── functions.js        # Business logic, privacy, notifications
│   │   └── monitoring.js       # Health, metrics endpoints
│   └── utils/
│       ├── entityName.js       # Entity name resolution
│       └── queryTranslator.js  # Query translation
│
├── scripts/                    # Operations scripts
│   ├── backup.sh               # Daily backup + S3 offsite push
│   ├── health-check.sh         # 60s health monitor (cert, disk, containers)
│   ├── alert-config.sh         # Webhook config (Discord/Slack)
│   ├── restore-verify.sh       # Backup restore verification
│   └── load_test.py            # Performance load testing
│
├── docs/                       # Documentation
│   ├── FAILOVER_PLAN.md        # 6-scenario recovery plan with RTO/RPO
│   └── GDPR_COMPLIANCE.md      # GDPR compliance audit
│
├── public/                     # Static assets & policy pages
│   ├── privacy.html            # GDPR privacy policy
│   ├── terms.html              # Terms of service
│   ├── assets/                 # Frontend build
│   └── anerium-onepass.apk     # Android app
│
├── docker-compose.yml          # App + DB with PG tuning + WAL
├── Dockerfile                  # Node.js 20 Alpine
├── schema.sql                  # Database schema (12 tables)
├── package.json                # Dependencies
└── .gitignore
```

## 🗄️ Database Schema

```
┌──────────┐     ┌──────────────┐     ┌───────────────────┐
│  users   │────►│ businesses  │────►│   discounts       │
│          │     │              │     └───────────────────┘
│ email    │     │ name         │     ┌───────────────────┐
│ password │     │ location     │────►│   campaigns       │
│ 2FA/OTP  │     │ category     │     └───────────────────┘
│ role     │     └──────────────┘     ┌───────────────────┐
└────┬─────┘                            │  user_memberships │
     │                                  └───────────────────┘
     ├──────────► transactions          ┌───────────────────┐
     ├──────────► reviews               │  support_tickets  │
     ├──────────► favorites             └───────────────────┘
     ├──────────► crm_records                  │
     ├──────────► campaigns                  chat_messages
     └──────────► notifications
```

| Table | Records | Purpose |
|-------|---------|---------|
| `users` | — | Accounts with email, password_hash, 2FA, role |
| `businesses` | — | Business listings with location & category |
| `discounts` | — | Time-limited discount offers |
| `user_memberships` | — | Loyalty membership tiers |
| `transactions` | — | Loyalty point transactions |
| `reviews` | — | Business reviews & ratings |
| `support_tickets` | — | Customer support tickets |
| `chat_messages` | — | Support chat messages |
| `crm_records` | — | CRM entries |
| `campaigns` | — | Marketing campaigns |
| `favorites` | — | User favorite businesses |
| `notifications` | — | Push & email notifications |

## 🔐 Security

| Layer | Protection |
|-------|-----------|
| **Server** | SSH key-only (password disabled), UFW firewall (22/80/443) |
| **Transport** | TLS 1.3 via Caddy, Let's Encrypt auto-renewal |
| **Headers** | HSTS, CSP, X-Frame-Options, COEP, COOP, CORP |
| **Auth** | JWT + Google OAuth + TOTP 2FA (Google Authenticator) |
| **Rate Limit** | 5 login attempts / 15 min (auth endpoints) |
| **CORS** | Locked to `anerium.com` and `anerium.de` |
| **Database** | WAL archiving, PITR, tuned for 4GB RAM |

## 📊 Monitoring & Alerts

| Check | Threshold | Frequency |
|-------|-----------|-----------|
| HTTP health | Non-200 response | Every 60s |
| SSL certificate | <30 days to expiry | Every 60s |
| Disk space | >80% used | Every 60s |
| Container status | Down/unhealthy | Every 60s |
| Dead tuples | >1000 | Every 60s |
| WAL archives | File count | Every 60s |
| **Alert delivery** | Discord/Slack webhook | On threshold breach |

## 🔄 Backup & Recovery

| Type | Schedule | Retention | Location |
|------|----------|-----------|----------|
| Database dump | Daily 3am UTC | 30 days | Local + S3 |
| Code backup | Daily 3am UTC | 30 days | Local + S3 |
| WAL archive | Continuous | PITR | Local |
| Offsite push | After backup | 90 days | Hetzner Storage Box (S3) |

### Recovery Objectives

| Scenario | RTO | RPO |
|----------|-----|-----|
| Container crash | <1 min | 0 |
| Server reboot | <5 min | 0 |
| Server failure | <3 hours | <5 min |
| DB corruption | <30 min | <5 min |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/Protremix/Anerium-.git
cd Anerium-

# Configure
cp .env.example .env
# Set: DB_PASSWORD, JWT_SECRET, OPENAI_PROJECT_KEY, etc.

# Deploy
docker compose up -d --build

# Verify
curl https://anerium.com/health
# {"status":"ok","uptime":"...","db":"connected"}
```

## 📋 API Overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | Public | Health check |
| `/api/apps/:id/auth/login` | POST | Public | Login (JWT + 2FA) |
| `/api/apps/:id/auth/register` | POST | Public | Register new user |
| `/api/apps/:id/auth/google/start` | GET | Public | Google OAuth start |
| `/api/apps/:id/auth/verify-otp` | POST | Temp token | Verify 2FA code |
| `/api/apps/:id/entities/:name` | GET | JWT | List entity records |
| `/api/apps/:id/entities/:name` | POST | JWT | Create record |
| `/api/apps/:id/entities/:name/:id` | PUT | JWT | Update record |
| `/api/apps/:id/entities/:name/:id` | DELETE | JWT | Delete record |
| `/api/apps/:id/monitoring/metrics` | GET | Admin | System metrics |

## 🌍 GDPR Compliance

| Requirement | Status |
|-------------|--------|
| Data stored in EU (Germany) | ✅ |
| Privacy policy page | ✅ [/privacy](https://anerium.com/privacy) |
| Terms of service page | ✅ [/terms](https://anerium.com/terms) |
| Marketing consent management | ✅ |
| Google OAuth consent screen | ✅ |
| Data retention policy | ✅ 30-day backups, 14-day logs |
| Failover & recovery plan | ✅ [docs/FAILOVER_PLAN.md](docs/FAILOVER_PLAN.md) |
| Account deletion (Art. 17) | ⚠️ Pending |
| Data export (Art. 20) | ⚠️ Pending |

## 🌿 Branches

| Branch | Purpose |
|--------|---------|
| `master` | Production stable — do not push directly |
| `protremix` | Development & design |
| `gh-pages` | GitHub Pages landing page |

## 📜 License

Proprietary — ANERIUM © 2026. All rights reserved.

---

<div align="center">

**Built with** ❤️ **on Hetzner Cloud, Nuremberg 🇩🇪**

[🌐 anerium.com](https://anerium.com) • [🌐 anerium.de](https://anerium.de)

</div>
