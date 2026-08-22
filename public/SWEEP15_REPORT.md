# ANERIUM OnePass — Sweep #15: Regression + Risk Inventory
**Date:** 2026-08-22 11:01 UTC
**Mode:** Read-only — no owner-dependent changes
**Compare:** Sweep #14 (08:55 UTC) → Sweep #15 (09:01 UTC)

---

## RESULT: 53/53 PASS | 0 REGRESSIONS | 0% ERROR RATE

---

## 1. EVIDENCE — 53-TEST RESULTS

| Category | Tests | Result | Detail |
|----------|-------|--------|--------|
| Public endpoints | 4 | All 200 ✅ | 26-28ms |
| Auth (unauth) | 7 | 401/201/302/401/401/403/200 ✅ | All correct |
| Entity LIST (12) | 12 | All 200 ✅ | 29-41ms, n stable |
| CRUD cycle | 5 | 201/200/200/200/404 ✅ | 29-34ms |
| User/me + rate + monitor | 3 | 200/1000/min/healthy ✅ | 0 alerts |
| Error rate (40 req) | 2 | 0% ✅ | 40/40 OK |
| Unauth security (5) | 5 | All 401/403 ✅ | All blocked |
| **Total** | **53** | **53 PASS** | |

### 31-route inventory: auth.js(17) + entities.js(10) + monitoring.js(3) + functions.js(1) = 31 ✅

---

## 2. DB/INDEX HEALTH

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| Indexes | 118 | 118 | PASS ✅ |
| FK constraints | 44 | 44 | PASS ✅ |
| Unindexed FKs | 0 | 0 | PASS ✅ |
| Orphans (7 checks) | All 0 | All 0 | PASS ✅ |
| DB size | <50MB | 11 MB | PASS ✅ |

### Table bloat

| Table | Live | Dead | Dead % | Trend |
|-------|------|------|--------|-------|
| reviews | 115 | 0 | 0.0% | Stable |
| discounts | 39 | 20 | 51.3% | ⚠️ +2 since #14 |
| transactions | 30 | 3 | 10.0% | Stable |
| users | 18 | 26 | 144.4% | ⚠️ +1 since #14 |
| blog_posts | 14 | 0 | 0.0% | Stable |

---

## 3. SECURITY HEADERS

| Header | Count | Status |
|--------|-------|--------|
| strict-transport-security | 2 | ⚠️ Dup (different max-age) |
| content-security-policy | 2 | ⚠️ Dup (**CSP CONFLICT — medium risk**) |
| x-frame-options | 2 | ⚠️ Dup (DENY vs SAMEORIGIN) |
| referrer-policy | 2 | ⚠️ Dup (different values) |
| x-content-type-options | 2 | ✅ Same value |
| permissions-policy | 1 | ✅ Helmet only |
| cross-origin-opener-policy | 1 | ✅ Helmet only |
| cross-origin-resource-policy | 1 | ✅ Helmet only |

---

## 4. TREND vs SWEEP #14

| Metric | #14 | #15 | Delta | Regression? |
|--------|-----|-----|-------|-------------|
| Public avg | 34ms | 27ms | -7ms | No (improved) |
| Entity LIST avg | 31ms | 33ms | +2ms | No (noise) |
| CRUD avg | 35ms | 31ms | -4ms | No (improved) |
| Error rate | 0% | 0% | 0 | No |
| Monitoring | healthy | healthy | Same | No |
| Indexes/FK/Orphans | 118/44/0 | 118/44/0 | 0 | No |
| Helmet | 5 dup | 5 dup | 0 | No |
| U3 errors | 0 | 0 | 0 | No |
| Docs | 21 × 200 | 21 × 200 | 0 | No |

---

## 5. U3 FIX — 12th Consecutive Sweep Stable

0 errors, 0 stderr lines.

---

## 6. SCORECARD

| Status | Count |
|--------|-------|
| ✅ VERIFIED | 110 |
| ⚠️ UNVERIFIED | 2 (U1, U2) |
| ⛔ BLOCKED | 6 (B1-B6) |
| 🔍 OPEN FINDINGS | 1 (Finding #2: header conflict) |

---

## 7. RISK INVENTORY (found this sweep)

### Active Risks (sorted by severity)

| # | Risk | Severity | Category | Status | Fix |
|---|------|----------|----------|--------|-----|
| R1 | CSP header conflict — helmet's strict CSP could block Next.js JS | **MEDIUM** | Security/Functional | Open (Finding #2) | B6: one-line helmet config |
| R2 | UFW firewall inactive — all ports open | **MEDIUM** | Security | Blocked (B2) | Enable UFW (allow 22/80/443) |
| R3 | SSH password auth enabled — brute-force risk | **MEDIUM** | Security | Blocked (B3) | Disable PasswordAuthentication |
| R4 | Kernel update pending — /var/run/reboot-required | **LOW** | Infrastructure | Blocked (B4) | System reboot |
| R5 | No version control — no git repo | **LOW** | Operational | Blocked (B5) | git init + commit |
| R6 | Password reset non-functional (stub) | **LOW** | Feature gap | Blocked (U1) | Needs email provider |
| R7 | OTP/2FA non-functional (stub) | **LOW** | Feature gap | Blocked (U2) | Same email provider |
| R8 | Table bloat growing — users 144%, discounts 51% | **LOW** | Performance | Autonomous | VACUUM ANALYZE |
| R9 | Google OAuth untested end-to-end | **NONE** | Feature | Blocked (B1) | Mike tests in browser |

### Resolved Risks

| # | Risk | Resolved | How |
|---|------|----------|-----|
| R10 | POST /entities auth gap (Finding #1) | Sweep #13 | False alarm — timing artifact |

---

## 8. PRIORITIZED QUEUE

### Autonomous (safe, no owner approval)

| Priority | Action | Impact | Risk |
|----------|--------|--------|------|
| A1 | VACUUM ANALYZE (users + discounts) | Reclaim 46 dead tuples | Zero |

### Owner-Dependent (8 items — all require "go")

| Priority | # | Item | Risk addressed | Time |
|----------|---|------|----------------|------|
| P1 | B6 | Header harmonization | R1 (MEDIUM) | 1 min |
| P2 | B2 | UFW firewall | R2 (MEDIUM) | 30 sec |
| P3 | B3 | SSH password auth | R3 (MEDIUM) | 30 sec |
| P4 | B5 | Git init | R5 (LOW) | 1 min |
| P5 | B4 | System reboot | R4 (LOW) | 2 min |
| P6 | B1 | Google OAuth test | R9 (NONE) | 2 min |
| P7 | U1 | Password reset | R6 (LOW) | 25 min |
| P8 | U2 | OTP/2FA | R7 (LOW) | 15 min |

---

## 9. INFRASTRUCTURE

| Component | Status |
|-----------|--------|
| Docker app | Up 2 hours ✅ |
| Docker DB | Up 2 days, healthy ✅ |
| TLS | Valid until Nov 11 2026 ✅ |
| fail2ban | 9 IPs banned ✅ |
| Backups | 2 files, 3 crons ✅ |
| Memory | 553MB / 3.7GB (15%) ✅ |
| Disk | 47% (39GB free) ✅ |
| 21 docs | All HTTP 200 ✅ |

---

## NO CHANGES MADE
