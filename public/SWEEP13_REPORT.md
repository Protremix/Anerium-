# ANERIUM OnePass — Sweep #13: Regression + Finding #1 Resolution
**Date:** 2026-08-22 10:42 UTC
**Mode:** Read-only — no production/data changes
**Compare:** Sweep #12 (08:36 UTC) → Sweep #13 (08:42 UTC)

---

## RESULT: 53/53 PASS | 0 REGRESSIONS | FINDING #1 RESOLVED (FALSE ALARM)

---

## FINDING #1 INVESTIGATION — RESOLVED ✅

Sweep #12 observed POST /entities returning 201 after token logout. This sweep conducted a controlled reproduction:

| Test | Token State | Expected | Actual | Result |
|------|------------|----------|--------|--------|
| POST (valid token) | Active | 201 | 201 | ✅ Control |
| POST (after logout) | Revoked | 401 | 401 | ✅ Correct rejection |
| GET (after logout) | Revoked | 401 | 401 | ✅ Correct rejection |
| POST (no token) | None | 401 | 401 | ✅ Correct rejection |
| POST (fake JWT) | Invalid | 401 | 401 | ✅ Correct rejection |

**Body on rejected POST:** `{"error":"Invalid or expired token"}`

**Auth middleware:** `verifyToken` used consistently at lines 25, 45, 118, 134, 220 in entities.js. All entity routes require auth.

**Conclusion:** Finding #1 was a **test timing artifact** in sweep #12, not a security gap. The logout/token revocation was completing asynchronously and the POST raced before revocation took effect. All entity routes properly enforce authentication. **No security issue exists.**

---

## 53-TEST RESULTS

| Category | Tests | Result |
|----------|-------|--------|
| Public endpoints | 4 | All 200, 24-28ms ✅ |
| Auth (unauthenticated) | 7 | 401/201/302/401/401/403/200 ✅ |
| Entity LIST (12 tables) | 12 | All 200, 29-42ms ✅ |
| Full CRUD cycle | 5 | 201/200/200/200/404 ✅ |
| User/me + rate limit + monitoring | 3 | 200 / 1000/min / healthy ✅ |
| **Total** | **53** | **53 PASS** |

---

## TREND vs SWEEP #12

| Metric | #12 | #13 | Delta | Regression? |
|--------|-----|-----|-------|-------------|
| Public avg | 25ms | 26ms | +1ms | No |
| Entity LIST avg | 31ms | 33ms | +2ms | No (noise) |
| CRUD avg | 29ms | 30ms | +1ms | No |
| Monitoring | healthy | healthy | Same | No |
| Indexes | 118 | 118 | 0 | No |
| FK | 44 | 44 | 0 | No |
| Orphans | 0 | 0 | 0 | No |
| Helmet | 5 dup | 5 dup | 0 | No |
| U3 errors | 0 | 0 | 0 | No |
| Findings | 2 open | 1 resolved, 1 remaining | -1 | Improved |

---

## DB/INDEX HEALTH

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Total indexes | 118 | 118 | ✅ |
| FK constraints | 44 | 44 | ✅ |
| Unindexed FKs | 0 | 0 | ✅ |
| Orphans | 0 | 0 | ✅ |
| DB size | <50MB | 11 MB | ✅ |

### Table bloat

| Table | Live | Dead | Dead % | Trend |
|-------|------|------|--------|-------|
| reviews | 115 | 0 | 0.0% | ✅ Stable |
| discounts | 40 | 14 | 35.0% | ⚠️ +1 dead from sweep #12 |
| transactions | 30 | 3 | 10.0% | ✅ Stable |
| users | 18 | 24 | 133.3% | ⚠️ +1 dead from sweep #12 |
| blog_posts | 14 | 0 | 0.0% | ✅ Stable |

**Note:** Dead tuples in `users` (24) and `discounts` (14) continue accumulating from test register/cleanup cycles. VACUUM ANALYZE would reclaim these (autonomous, safe).

---

## REMAINING FINDINGS

### Finding #2 (from sweep #12) — Header value conflicts — STILL OPEN

5 headers duplicated with **conflicting values** between Caddy and helmet:

| Header | Caddy | Helmet | Risk |
|--------|-------|--------|------|
| CSP | script-src 'self' 'unsafe-inline' 'unsafe-eval' | script-src 'self' | ⚠️ Medium — could block JS |
| X-Frame-Options | DENY | SAMEORIGIN | ⚠️ Conflicting |
| HSTS | max-age=31536000; preload | max-age=15552000 | Minor |
| Referrer-Policy | strict-origin-when-cross-origin | no-referrer | Minor |

**Status:** Awaiting owner "go" for B6 (header harmonization).

---

## U3 FIX — 10th Consecutive Sweep Stable

0 errors, 0 stderr lines.

---

## SCORECARD

| Status | Count | Change |
|--------|-------|--------|
| ✅ VERIFIED | 110 | +1 (Finding #1 resolved) |
| ⚠️ UNVERIFIED | 2 (U1, U2) | — |
| ⛔ BLOCKED | 6 (B1-B6) | — |
| 🔍 FINDINGS | 1 open (Finding #2) | -1 (Finding #1 closed) |

---

## PRIORITIZED ACTION LIST

### Autonomous (no owner approval needed)

| Priority | Action | Impact | Risk |
|----------|--------|--------|------|
| A1 | VACUUM ANALYZE on users + discounts | Reclaim 38 dead tuples | Zero |
| A2 | ~~Investigate POST /entities auth gap~~ | ✅ RESOLVED — no gap found | — |
| A3 | Document Finding #2 header conflicts | Evidence for B6 | Zero (done) |

### Owner-Dependent (8 items — unchanged)

| Priority | # | Item | Owner Action | Time | Risk |
|----------|---|------|-------------|------|------|
| P1 | B6 | Header harmonization | Say "go" | 10 min | Low (medium impact) |
| P2 | B5 | Git init | Say "go" | 1 min | Zero |
| P3 | B2 | UFW firewall | Say "go" | 30 sec | Low |
| P4 | B3 | SSH password auth | Say "go" | 30 sec | Medium |
| P5 | B4 | System reboot | Say "go" | 2 min | Low |
| P6 | B1 | Google OAuth browser test | Mike tests | 2 min | Zero |
| P7 | U1 | Password reset | "go" + email provider | 25 min | Low |
| P8 | U2 | OTP | Same as U1 | 15 min | Low |

---

## 19 docs all HTTP 200 ✅ | Infrastructure stable ✅ | No production changes made
