# ANERIUM OnePass — Architecture Overview

## System Architecture

```
                    Internet
                       |
                   [IONOS DNS]
              anerium.com → 178.104.121.35
                       |
              [Caddy Reverse Proxy]
              Auto-HTTPS (Let's Encrypt)
                       |
              [Docker Compose Network]
              /                    \
        [anerium-app-1]         [anerium-db-1]
        Node.js + Express       PostgreSQL 16
        Port 3001               Port 5432
              \                    /
               \─── Connection pool ─/
```

## Components

### 1. Caddy Reverse Proxy
- Listens on ports 80/443
- Auto-provisions TLS certificates via Let's Encrypt
- Proxies all traffic to Node.js app on port 3001
- Serves as the public-facing entry point

### 2. Node.js Backend (Express)
- Entry point: `src/app.js`
- Serves both API routes and static frontend files
- Middleware stack: helmet → CORS → rate limiting → input sanitization → JSON body parser → metrics middleware

### 3. PostgreSQL 16
- 24 entity tables, 210+ records
- 44 FK constraints, 118 indexes (74 base + 44 FK indexes added)
- Connection pooling via `pg` library
- All queries parameterized (zero SQL injection risk)

### 4. Frontend SPA
- Built with Vite (Next.js compatible)
- Served as static files from `/opt/anerium/public/`
- SPA fallback — all non-API routes serve `index.html`

## Request Flow

```
Client Request
    ↓
Caddy (TLS termination, reverse proxy)
    ↓
Express app.js
    ↓
helmet (security headers)
    ↓
CORS (origin whitelist check)
    ↓
Rate limiter (auth: 100/min, API: 1000/min)
    ↓
Input sanitization (strip scripts, HTML, javascript: URIs)
    ↓
JSON body parser (10mb limit)
    ↓
Metrics middleware (track response time, errors)
    ↓
Route handler (auth.js / entities.js / functions.js / monitoring.js)
    ↓
PostgreSQL (parameterized query)
    ↓
Response (sanitized — no password_hash, no internal fields)
```

## Authentication Flow

### Email/Password
```
Client → POST /api/apps/:appId/auth/login { email, password }
    → Server: SELECT * FROM users WHERE email = $1
    → verifyPassword(password, user.password_hash) [bcrypt]
    → generateToken(user.id) [JWT signed with JWT_SECRET]
    → Response: { access_token, user: sanitizeUser(user) }
```

### Google OAuth
```
Client → GET /api/apps/:appId/auth/google/start
    → Redirect to Google consent screen
    → Google redirects back with code
    → Server: exchange code for tokens
    → Fetch user info from Google
    → Find or create user in DB
    → generateToken(user.id)
    → Redirect: anerium://redirect?token=<jwt> (mobile)
              or /auth-callback.html?token=<jwt> (web popup)
```

## Security Layers

| Layer | Protection |
|-------|-----------|
| Caddy | TLS 1.3, automatic HTTPS |
| Helmet | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| CORS | Whitelist: anerium.com, anerium.de, www variants, localhost |
| Rate Limiting | Auth: 100/min/IP · API: 1000/min/user, 100/min/IP |
| Input Sanitization | Strip `<script>`, HTML tags, `javascript:` URIs from all body fields |
| JWT Auth | Bearer token required on all entity/function routes, revocable |
| Password Security | bcrypt hashing, never returned in any response |
| SQL Injection | 100% parameterized queries, zero raw concatenation |
| Entity Sanitization | `sanitizeUser()` strips password_hash from all User responses |

## Database Schema

20 entity tables organized into 5 domains:

1. **User domain:** users, permissions, sessions, devices, qr_codes
2. **Business domain:** businesses, business_categories, business_locations, business_documents, employees, employee_schedules
3. **Customer engagement:** reviews, review_replies, favorites, loyalty_points, loyalty_tiers, discounts, coupons
4. **Commerce:** transactions, subscriptions, user_memberships, membership_plans, payments, invoices, base44_purchases, gift_campaigns, gift_redemptions
5. **Operations:** campaigns, campaign_audience, campaign_messages, blog_posts, support_tickets, ticket_messages, chat_messages, notifications, notification_templates, crm_records, system_settings, webhook_configs, webhook_logs, audit_logs, security_incidents, compliance_requests

## Monitoring Architecture

```
In-memory metrics store (per server instance)
    ↓
Metrics middleware → tracks every /api request
    ↓
Pool.query wrapper → tracks every DB query
    ↓
Alerting engine → fires on threshold breach:
    - ENDPOINT_SLOW (>500ms) → warning
    - DB_SLOW_QUERY (>100ms) → warning
    - HIGH_ERROR_RATE (>1%) → critical
    - DB_ERROR → critical
    ↓
API endpoints:
    GET /api/monitoring/health → full dashboard JSON
    GET /api/monitoring/alerts → active alerts only
    POST /api/monitoring/reset → clear metrics
    ↓
Dashboard UI: /monitoring (auto-refresh 5s)
    ↓
Cron health check: every minute → /var/log/anerium-health.log
```

## Scaling Considerations

- **Current:** Single server, single container instance
- **Next step:** Add a load balancer + multiple app containers
- **Metrics store:** Currently in-memory (resets on restart) — upgrade to Redis for persistence
- **Database:** Single PostgreSQL instance — add read replicas at ~10K users
- **Static assets:** Served by Node.js — move to CDN (Cloudflare) for scale
