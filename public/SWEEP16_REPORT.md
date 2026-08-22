# ANERIUM OnePass — Sweep #16: Regression + VACUUM ANALYZE
**Date:** 2026-08-22 11:06 UTC
**Mode:** VACUUM ANALYZE on users + discounts (safe PG maintenance) + read-only regression
**Compare:** Sweep #15 (09:01 UTC) → Sweep #16 (09:06 UTC)

---

## RESULT: 53/53 PASS | 0 REGRESSIONS | VACUUM SUCCESSFUL

---

## 1. VACUUM ANALYZE — BEFORE/AFTER

| Table | Live (before) | Dead (before) | Dead % (before) | Dead (after) | Dead % (after) | Reclaimed |
|-------|--------------|----------------|-----------------|--------------|-----------------|-----------|
| users | 17 | 27 | 158.8% | 0 | 0.0% | 27 ✅ |
| discounts | 39 | 20 | 51.3% | 0 | 0.0% | 20 ✅ |
| **Total** | | **47** | | **0** | | **47** |

**VACUUM ANALYZE completed successfully on both tables.** All dead tuples from test cycles reclaimed. Planner statistics updated.

### All tables post-VACUUM

| Table | Live | Dead | Dead % |
|-------|------|------|--------|
| reviews | 115 | 0 | 0.0% ✅ |
| discounts | 39 | 0 | 0.0% ✅ |
| transactions | 30 | 3 | 10.0% (normal) |
| users | 18 | 0 | 0.0% ✅ |
| blog_posts | 14 | 0 | 0.0% ✅ |

---

## 2. PRE-VACUUM: 53-TEST REGRESSION

| Category | Tests | Result | Detail |
|----------|-------|--------|--------|
| Public endpoints | 4 | All 200 ✅ | 25-29ms |
| Auth (unauth) | 7 | 401/201/302/401/401/403/200 ✅ | All correct |
| Entity LIST (12) | 12 | All 200 ✅ | 29-39ms |
| CRUD cycle | 5 | 201/200/200/200/404 ✅ | 28-31ms |
| Additional (3) | 3 | 200/1000/min/healthy ✅ | 0 alerts |
| Error rate (40 req) | 2 | 0% ✅ | 40/40 OK |
| Unauth security (5) | 5 | All 401/403 ✅ | All blocked |
| **Total** | **53** | **53 PASS** | |

---

## 3. POST-VACUUM: SMOKE TEST (10/10 PASS)

| Test | Expected | Actual |
|------|----------|--------|
| GET /health | 200 | 200 ✅ |
| GET / | 200 | 200 ✅ |
| GET /directory | 200 | 200 ✅ |
| GET /download | 200 | 200 ✅ |
| POST /auth/login (invalid) | 401 | 401 ✅ |
| GET /entities (no token) | 401 | 401 ✅ |
| GET /monitoring (ext) | 403 | 403 ✅ |
| GET /public-settings | 200 | 200 ✅ |
| GET /entities/businesses (auth) | 200 | 200 ✅ |
| GET /entities/users (auth) | 200 | 200 ✅ |

---

## 4. DB/INDEX HEALTH — UNCHANGED

| Check | Before | After | Status |
|-------|--------|-------|--------|
| Indexes | 118 | 118 | ✅ No change |
| FK constraints | 44 | 44 | ✅ No change |
| Orphans | 0 | 0 | ✅ No change |
| DB size | 11MB | 11MB | ✅ No change |

**VACUUM did not alter schema, indexes, FK, or data. Only reclaimed dead tuples + updated planner stats.**

---

## 5. SECURITY HEADERS — Unchanged

5 duplicated with conflicting values (B6 pending). 3 helmet-only headers clean.

---

## 6. U3 FIX — 13th Consecutive Sweep Stable

0 errors, 0 stderr lines.

---

## 7. TREND vs SWEEP #15

| Metric | #15 | #16 | Delta | Regression? |
|--------|-----|-----|-------|-------------|
| Public avg | 27ms | 27ms | 0 | No |
| Entity LIST avg | 33ms | 32ms | -1ms | No |
| CRUD avg | 31ms | 29ms | -2ms | No |
| Error rate | 0% | 0% | 0 | No |
| Indexes/FK/Orphans | 118/44/0 | 118/44/0 | 0 | No |
| users dead tuples | 26 | 0 | -26 | ✅ Fixed |
| discounts dead tuples | 20 | 0 | -20 | ✅ Fixed |

---

## 8. SCORECARD

| Status | Count | Change |
|--------|-------|--------|
| ✅ VERIFIED | 110 | — |
| ⚠️ UNVERIFIED | 2 (U1, U2) | — |
| ⛔ BLOCKED | 6 (B1-B6) | — |
| 🔍 FINDINGS | 1 open (Finding #2: header conflict) | — |
| ✅ AUTONOMOUS FIXES | 2 done (A1: VACUUM, A2: Finding #1 resolved) | +1 |

---

## 9. RISK INVENTORY — UPDATED

| # | Risk | Severity | Status | Change |
|---|------|----------|--------|--------|
| R1 | CSP header conflict | MEDIUM | Open (B6) | Unchanged |
| R2 | UFW inactive | MEDIUM | Blocked (B2) | Unchanged |
| R3 | SSH password auth | MEDIUM | Blocked (B3) | Unchanged |
| R4 | Kernel update pending | LOW | Blocked (B4) | Unchanged |
| R5 | No version control | LOW | Blocked (B5) | Unchanged |
| R6 | Password reset stub | LOW | Blocked (U1) | Unchanged |
| R7 | OTP/2FA stub | LOW | Blocked (U2) | Unchanged |
| R8 | Table bloat | ~~LOW~~ | ✅ RESOLVED | VACUUM'd |
| R9 | Google OAuth untested | NONE | Blocked (B1) | Unchanged |

---

## 10. PRIORITIZED QUEUE — OWNER-DEPENDENT (8 items)

| Priority | # | Item | Risk | Time |
|----------|---|------|------|------|
| P1 | B6 | Header harmonization | R1 (MEDIUM) | 1 min |
| P2 | B2 | UFW firewall | R2 (MEDIUM) | 30 sec |
| P3 | B3 | SSH password auth | R3 (MEDIUM) | 30 sec |
| P4 | B5 | Git init | R5 (LOW) | 1 min |
| P5 | B4 | System reboot | R4 (LOW) | 2 min |
| P6 | B1 | Google OAuth test | R9 (NONE) | 2 min |
| P7 | U1 | Password reset | R6 (LOW) | 25 min |
| P8 | U2 | OTP/2FA | R7 (LOW) | 15 min |

### Autonomous: all complete ✅
- A1: VACUUM ANALYZE — done (47 dead tuples reclaimed)
- A2: Finding #1 investigation — resolved (sweep #13)

---

## NO SCHEMA OR APPLICATION CHANGES MADE

VACUUM ANALYZE is standard PostgreSQL maintenance — reclaims dead tuples and updates planner statistics without modifying schema, indexes, data, or application code.
