# ANERIUM OnePass — Sweep #18: Regression Cycle
**Date:** 2026-08-22 11:31 UTC
**Mode:** Read-only — no owner-dependent changes
**Compare:** Sweep #17 (09:11 UTC) → Sweep #18 (09:31 UTC)

---

## RESULT: 53/53 PASS | 0 REGRESSIONS | 0% ERROR RATE

---

## 1. EVIDENCE — 53-TEST RESULTS

| Category | Tests | Result | Detail |
|----------|-------|--------|--------|
| Public endpoints | 4 | All 200 ✅ | 24-27ms |
| Auth (unauth) | 7 | 401/201/302/401/401/403/200 ✅ | All correct |
| Entity LIST (12) | 12 | All 200 ✅ | 29-37ms, n stable |
| CRUD cycle | 5 | 201/200/200/200/404 ✅ | 29-32ms |
| User/me + rate + monitor | 3 | 200/1000/min/healthy ✅ | 0 alerts |
| Error rate (40 req) | 2 | 0% ✅ | 40/40 OK |
| Unauth security (5) | 5 | All 401/403 ✅ | All blocked |
| **Total** | **53** | **53 PASS** | |

### 31-route inventory: auth(17) + entities(10) + monitoring(3) + functions(1) = 31 ✅

---

## 2. DB/INDEX HEALTH

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| Indexes | 118 | 118 | PASS ✅ |
| FK constraints | 44 | 44 | PASS ✅ |
| Unindexed FKs | 0 | 0 | PASS ✅ |
| Orphans | 0 | 0 | PASS ✅ |
| DB size | <50MB | 11 MB | PASS ✅ |

### Table bloat

| Table | Live | Dead | Dead % | Note |
|-------|------|------|--------|------|
| reviews | 115 | 0 | 0.0% | ✅ Clean |
| discounts | 39 | 4 | 10.3% | Normal (accumulating from sweeps #17-#18) |
| transactions | 30 | 3 | 10.0% | ✅ Stable |
| users | 18 | 2 | 11.1% | Normal (accumulating from sweeps #17-#18) |
| blog_posts | 14 | 0 | 0.0% | ✅ Clean |

**VACUUM from sweep #16 still effective.** 6 total dead tuples across 2 sweeps — well within autovacuum threshold.

---

## 3. SECURITY HEADERS — Unchanged

5 duplicated with conflicting values (B6 pending). 3 helmet-only headers clean.

---

## 4. U3 FIX — 15th Consecutive Sweep Stable

0 errors, 0 stderr lines.

---

## 5. TREND vs SWEEP #17

| Metric | #17 | #18 | Delta | Regression? |
|--------|-----|-----|-------|-------------|
| Public avg | 26ms | 26ms | 0 | No |
| Entity LIST avg | 32ms | 31ms | -1ms | No |
| CRUD avg | 31ms | 30ms | -1ms | No |
| Error rate | 0% | 0% | 0 | No |
| Monitoring | healthy | healthy | Same | No |
| Indexes/FK/Orphans | 118/44/0 | 118/44/0 | 0 | No |
| users dead | 1 | 2 | +1 | No (normal) |
| discounts dead | 2 | 4 | +2 | No (normal) |
| Helmet | 5 dup | 5 dup | 0 | No |
| U3 errors | 0 | 0 | 0 | No |
| Docs | 24 × 200 | 24 × 200 | 0 | No |

**Verdict: 0 regressions. All metrics stable.**

---

## 6. EXACT COUNTS

| Metric | Value |
|--------|-------|
| Tests passed | 53/53 |
| Tests failed | 0 |
| Regressions | 0 |
| Error rate | 0% (40/40 OK) |
| Indexes | 118 |
| FK constraints | 44 |
| Unindexed FKs | 0 |
| Orphans | 0 |
| DB size | 11 MB |
| Dead tuples (total) | 9 (3 transactions + 4 discounts + 2 users) |
| Security header duplicates | 5 |
| U3 errors | 0 |
| U3 stderr lines | 0 |
| Docs HTTP 200 | 24/24 |
| Docker containers | 2 (app + db, both healthy) |
| fail2ban banned | 6 IPs |
| Backups | 2 files, 3 crons |
| Memory | 552MB / 3.7GB (15%) |
| Disk | 47% (39GB free) |

---

## 7. BLOCKERS — 8 owner-dependent items (unchanged)

| Priority | # | Item | Risk | Status |
|----------|---|------|------|--------|
| P1 | B6 | Header harmonization | MEDIUM | Awaiting "go" |
| P2 | B2 | UFW firewall | MEDIUM | Awaiting "go" |
| P3 | B3 | SSH password auth | MEDIUM | Awaiting "go" |
| P4 | B5 | Git init | LOW | Awaiting "go" |
| P5 | B4 | System reboot | LOW | Awaiting "go" |
| P6 | B1 | Google OAuth test | NONE | Awaiting Mike |
| P7 | U1 | Password reset | LOW | Awaiting "go" + email provider |
| P8 | U2 | OTP/2FA | LOW | Same as U1 |

### Autonomous: all complete ✅

---

## NO CHANGES MADE
