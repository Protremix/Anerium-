# ANERIUM OnePass — Sweep #14: Full Regression + Priority Queue
**Date:** 2026-08-22 10:55 UTC
**Mode:** Read-only — no owner-dependent changes
**Compare:** Sweep #13 (08:42 UTC) → Sweep #14 (08:55 UTC)

---

## RESULT: 53/53 PASS | 0 FAIL | 0 REGRESSIONS

---

## 1. EVIDENCE — 53-TEST RESULTS

### Public Endpoints (4/4 PASS)

| Endpoint | Status | Time | Verdict |
|----------|--------|------|---------|
| GET /health | 200 | 50ms | PASS |
| GET / | 200 | 27ms | PASS |
| GET /directory | 200 | 27ms | PASS |
| GET /download | 200 | 32ms | PASS |

### Auth (7/7 PASS)

| Endpoint | Status | Verdict |
|----------|--------|---------|
| POST /auth/login (invalid) | 401 | PASS — correct rejection |
| POST /auth/register | 201 | PASS — user created |
| GET /auth/google/start | 302 | PASS — redirect to Google |
| GET /entities (no token) | 401 | PASS — auth enforced |
| GET /entities (fake JWT) | 401 | PASS — none-alg rejected |
| GET /monitoring (ext) | 403 | PASS — external blocked |
| GET /public-settings | 200 | PASS — public access |

### Entity LIST (12/12 PASS)

| Entity | Status | Time | Records |
|--------|--------|------|---------|
| businesses | 200 | 41ms | 8 |
| users | 200 | 30ms | 18 |
| reviews | 200 | 36ms | 100 |
| discounts | 200 | 32ms | 39 |
| transactions | 200 | 30ms | 30 |
| loyalty_points | 200 | 29ms | 5 |
| campaigns | 200 | 30ms | 7 |
| blog_posts | 200 | 29ms | 14 |
| coupons | 200 | 30ms | 0 |
| bookings | 200 | 30ms | 0 |
| membership_plans | 200 | 30ms | 10 |
| user_memberships | 200 | 30ms | 0 |

### CRUD Cycle (5/5 PASS)

| Operation | Status | Time |
|-----------|--------|------|
| CREATE | 201 | 31ms |
| GET by ID | 200 | 38ms |
| UPDATE | 200 | 32ms |
| DELETE | 200 | 39ms |
| GET deleted → 404 | 404 | — |

### Additional (3/3 PASS)

| Check | Result |
|-------|--------|
| User/me | 200 ✅ |
| Rate limit | 1000;w=60 ✅ |
| Monitoring | healthy, 0 alerts, 22 endpoints ✅ |

### Error Rate (0%)

| Test | Requests | OK | Errors | Rate |
|------|----------|----|--------|------|
| /health × 20 | 20 | 20 | 0 | 0% ✅ |
| /entities/businesses × 20 | 20 | 20 | 0 | 0% ✅ |

### Unauth Security (5/5 PASS)

| Attempt | Expected | Actual |
|----------|----------|--------|
| GET /entities (no auth) | 401 | 401 ✅ |
| POST /entities (no auth) | 401 | 401 ✅ |
| DELETE /entities (no auth) | 401 | 401 ✅ |
| GET /monitoring (ext) | 403 | 403 ✅ |
| POST /monitoring/reset (ext) | 403 | 403 ✅ |

---

## 2. 31-ROUTE INVENTORY VALIDATION

| File | Routes | Status |
|------|--------|--------|
| auth.js | 17 | ✅ All validated (11 implemented, 5 stubs, 1 OAuth callback) |
| entities.js | 10 | ✅ All validated (CRUD + bulk + update-many + User/me) |
| monitoring.js | 3 | ✅ All validated (health, alerts, reset) |
| functions.js | 1 | ✅ Validated (404 for nonexistent) |
| **Total** | **31** | ✅ |

---

## 3. SECURITY HEADERS

| Header | Count | Status |
|--------|-------|--------|
| strict-transport-security | 2 | ⚠️ Dup — different max-age |
| content-security-policy | 2 | ⚠️ Dup — **CSP CONFLICT (medium risk)** |
| x-frame-options | 2 | ⚠️ Dup — DENY vs SAMEORIGIN |
| referrer-policy | 2 | ⚠️ Dup — different values |
| x-content-type-options | 2 | ✅ Same value (nosniff) |
| permissions-policy | 1 | ✅ Helmet only |
| cross-origin-opener-policy | 1 | ✅ Helmet only |
| cross-origin-resource-policy | 1 | ✅ Helmet only |

**Finding #2 status:** OPEN — CSP conflict could block Next.js inline scripts. Fix prepared (one-line helmet config), awaiting owner "go".

---

## 4. DB/INDEX HEALTH

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| Total indexes | 118 | 118 | PASS ✅ |
| FK constraints | 44 | 44 | PASS ✅ |
| Unindexed FKs | 0 | 0 | PASS ✅ |
| Orphans (7 checks) | All 0 | All 0 | PASS ✅ |
| DB size | <50MB | 11 MB | PASS ✅ |

### Table bloat (accumulating from test cycles)

| Table | Live | Dead | Dead % | Trend |
|-------|------|------|--------|-------|
| reviews | 115 | 0 | 0.0% | Stable ✅ |
| discounts | 39 | 18 | 46.2% | ⚠️ +4 since #13 |
| transactions | 30 | 3 | 10.0% | Stable ✅ |
| users | 18 | 25 | 138.9% | ⚠️ +1 since #13 |
| blog_posts | 14 | 0 | 0.0% | Stable ✅ |

**Autonomous fix available:** VACUUM ANALYZE would reclaim 43 dead tuples (safe, zero-risk PG maintenance).

---

## 5. TREND vs SWEEP #13

| Metric | #13 | #14 | Delta | Regression? |
|--------|-----|-----|-------|-------------|
| Public avg | 26ms | 34ms | +8ms | No (1 outlier at 50ms) |
| Entity LIST avg | 33ms | 31ms | -2ms | No |
| CRUD avg | 30ms | 35ms | +5ms | No (noise) |
| Error rate | 0% | 0% | 0 | No |
| Monitoring | healthy | healthy | Same | No |
| Indexes | 118 | 118 | 0 | No |
| FK | 44 | 44 | 0 | No |
| Orphans | 0 | 0 | 0 | No |
| Helmet | 5 dup | 5 dup | 0 | No |
| U3 errors | 0 | 0 | 0 | No |
| Docs | 20 × 200 | 20 × 200 | 0 | No |

**Verdict: 0 regressions. All metrics stable.**

---

## 6. U3 FIX — 11th Consecutive Sweep Stable

0 errors, 0 stderr lines.

---

## 7. SCORECARD

| Status | Count |
|--------|-------|
| ✅ VERIFIED | 110 |
| ⚠️ UNVERIFIED | 2 (U1, U2) |
| ⛔ BLOCKED | 6 (B1-B6) |
| 🔍 FINDINGS | 1 open (Finding #2: header conflicts) |

---

## 8. PRIORITIZED QUEUE — ITEMS AWAITING APPROVAL

### Owner-Dependent (8 items — all require "go" from Mike)

| Priority | # | Item | Risk if delayed | Time to fix | Details |
|----------|---|------|----------------|-------------|---------|
| **P1** | B6 | Header harmonization | **MEDIUM** — CSP could block JS | 1 min | One-line helmet config change. Fix prepared. |
| P2 | B5 | Git init | Low — no version control | 1 min | `git init` + initial commit |
| P3 | B2 | UFW firewall | Medium — all ports open | 30 sec | Allow 22/80/443, deny rest |
| P4 | B3 | SSH password auth | Medium — brute-force risk | 30 sec | Set PasswordAuthentication no |
| P5 | B4 | System reboot | Low — kernel not updated | 2 min | `/var/run/reboot-required` present |
| P6 | B1 | Google OAuth browser test | None — 302 ready | 2 min | Mike tests in browser |
| P7 | U1 | Password reset | None — stub works | 25 min | Needs email provider choice |
| P8 | U2 | OTP / 2FA | None — stub works | 15 min | Same email provider as U1 |

### Autonomous (no approval needed — safe, zero-risk)

| Priority | Action | Impact | Risk |
|----------|--------|--------|------|
| A1 | VACUUM ANALYZE (users + discounts) | Reclaim 43 dead tuples | Zero |
| A2 | ~~Investigate POST /entities auth~~ | ✅ Resolved (sweep #13) | — |

---

## 9. INFRASTRUCTURE

| Component | Status |
|-----------|--------|
| Docker app | Up ~1 hour ✅ |
| Docker DB | Up 2 days, healthy ✅ |
| TLS | Valid until Nov 11 2026 ✅ |
| fail2ban | 9 IPs banned ✅ |
| Backups | 2 files, 3 cron entries ✅ |
| Memory | 550MB / 3.7GB (15%) ✅ |
| Disk | 47% (39GB free) ✅ |
| 20 docs | All HTTP 200 ✅ |

---

## NO CHANGES MADE

No auth, headers, firewall, SSH, reboot, data, or configuration changed.
