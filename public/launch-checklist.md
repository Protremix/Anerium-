# ANERIUM OnePass — Production Launch Checklist

## ✅ Pre-Launch (COMPLETED)

### Security
- [x] JWT authentication on all entity/function routes
- [x] Password hashing (bcrypt) — never returned in responses
- [x] CORS locked to anerium.com, anerium.de, www variants, localhost
- [x] Rate limiting: auth 100/min/IP, API 1000/min/user
- [x] Input sanitization (strip scripts, HTML, javascript: URIs)
- [x] Helmet security headers (HSTS, CSP, X-Frame-Options, etc.)
- [x] SQL injection: 100% parameterized queries
- [x] XSS: input sanitization + helmet CSP
- [x] Penetration test: 7/7 vectors blocked (SQLi, XSS, auth bypass, path traversal, CORS, password leak, rate limit)

### Database
- [x] 44 FK constraints defined
- [x] 118 indexes (74 base + 44 FK indexes)
- [x] Zero orphaned records (15 cleaned)
- [x] Zero duplicate emails
- [x] VACUUM ANALYZE run on all tables
- [x] All query execution times under 0.3ms

### Performance
- [x] All endpoints under 120ms response time
- [x] Health endpoint: 26ms avg
- [x] Homepage: 27ms avg
- [x] Directory page: 25ms avg
- [x] Login endpoint: 28ms avg
- [x] Server load: 0.02 (near idle)
- [x] Memory usage: 20% (plenty of headroom)

### Infrastructure
- [x] Docker Compose orchestration
- [x] Caddy reverse proxy with auto-HTTPS
- [x] PostgreSQL 16 running in container
- [x] Domain DNS configured (IONOS → server IP)
- [x] TLS certificates auto-provisioned

### Monitoring
- [x] Real-time dashboard at /monitoring
- [x] API metrics tracking (endpoint response times, error rates)
- [x] DB query performance tracking
- [x] Alerting rules: endpoint >500ms, DB >100ms, error rate >1%
- [x] Automated health check script (cron, every minute)
- [x] Health check logging to /var/log/anerium-health.log

### Documentation
- [x] API documentation (28+ endpoints documented)
- [x] Deployment guide
- [x] Architecture overview
- [x] Production launch checklist (this document)

---

## ⚠️ Before Going Live (RECOMMENDED)

### Must-Do
- [ ] Configure Google OAuth credentials in Google Cloud Console
  - Authorized redirect URIs:
    - `https://anerium.com/auth/google/callback`
    - `https://anerium.com/api/apps/6a7d630d865dd7ed11a16a3c/auth/google/callback`
- [ ] Set up automated database backups (cron + pg_dump)
  - Recommended: daily full backup, retained 30 days
- [ ] Restrict /api/monitoring/* endpoints to admin-only or IP whitelist via Caddy
- [ ] Test the full user registration → login → profile flow end-to-end
- [ ] Test Google OAuth login flow end-to-end
- [ ] Verify email delivery if password reset emails are needed

### Should-Do
- [ ] Set up log rotation for /var/log/anerium-health.log
- [ ] Configure Caddy access logs
- [ ] Set up UFW firewall rules (allow only 80, 443, 22)
- [ ] Create non-root user for SSH access
- [ ] Disable SSH password authentication (key-only)
- [ ] Set up fail2ban for SSH brute-force protection
- [ ] Create a staging environment for testing changes

### Nice-to-Have
- [ ] Move static assets to CDN (Cloudflare)
- [ ] Add Redis for persistent metrics store
- [ ] Implement structured logging (Winston or Pino)
- [ ] Add Sentry or similar error tracking
- [ ] Set up Grafana + Prometheus for advanced monitoring
- [ ] Implement automated DB backups to S3-compatible storage
- [ ] Add health check webhook to Slack/Discord for critical alerts
- [ ] Set up CI/CD pipeline (GitHub Actions → Docker Hub → server)
- [ ] Generate OpenAPI/Swagger spec from route definitions
- [ ] Add request ID tracking for debugging

---

## 🚀 Launch Steps (In Order)

1. **DNS:** Verify anerium.com and anerium.de resolve to 178.104.121.35
2. **TLS:** Verify `https://anerium.com/health` returns `{"status":"ok"}`
3. **Google OAuth:** Configure credentials in Google Cloud Console
4. **Firewall:** Enable UFW — allow 80, 443, 22 only
5. **Backups:** Set up daily `pg_dump` cron job
6. **Test:** Complete full user journey (register → login → browse → review)
7. **Monitor:** Watch /monitoring dashboard for 30 minutes under traffic
8. **Go Live:** Remove any maintenance page, announce launch

---

## Post-Launch Monitoring

- Check `/var/log/anerium-health.log` daily for critical alerts
- Monitor `/monitoring` dashboard for performance trends
- Watch for growing error rates on any endpoint
- Track database query performance as data grows
- Run `VACUUM ANALYZE` weekly on high-activity tables
- Review disk space monthly (currently 43% used)

---

## Emergency Contacts

- **Server:** Hetzner Cloud — console.cloud.hetzner.com
- **DNS:** IONOS — my.ionos.com
- **OAuth:** Google Cloud Console — console.cloud.google.com
- **Health Check Log:** `tail -100 /var/log/anerium-health.log`
- **Container Logs:** `docker logs anerium-app-1 --tail 100`
- **DB Logs:** `docker logs anerium-db-1 --tail 50`

## Emergency Recovery

```bash
# Restart app container
cd /opt/anerium && docker compose restart app

# Restart everything
cd /opt/anerium && docker compose down && docker compose up -d

# Restore database from backup
docker exec -i anerium-db-1 psql -U anerium -d anerium < /backups/anerium_YYYYMMDD.sql

# Rebuild from scratch
cd /opt/anerium && docker compose build --no-cache && docker compose up -d
```
