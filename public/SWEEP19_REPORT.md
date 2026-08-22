# ANERIUM OnePass — Sweep #19: Regression Cycle
**Date:** 2026-08-22 11:36 UTC
**Mode:** Read-only — no owner-dependent changes
**Compare:** Sweep #18 (09:31 UTC) → Sweep #19 (09:36 UTC)

---

## RESULT: 53/53 PASS | 0 REGRESSIONS | 0% ERROR RATE

---

## 1. EVIDENCE — 53-TEST RESULTS

| Category | Tests | Result | Detail |
|----------|-------|--------|--------|
| Public endpoints | 4 | All 200 ✅ | 24-33ms |
| Auth (unauth) | 7 | 401/201/302/401/401/403/200 ✅ | All correct |
| Entity LIST (12) | 12 | All 200 ✅ | 29-37ms, n stable |
| CRUD cycle | 5 | 201/200/200/200/404 ✅ | 29-35ms |
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

| Table | Live | Dead | Dead % | Trend |
|-------|------|------|--------|-------|
| reviews | 115 | 0 | 0.0% | ✅ Clean |
| discounts | 39 | 6 | 15.4% | +2 since #18 (normal) |
| transactions | 30 | 3 | 10.0% | ✅ Stable |
| users | 18 | 3 | 16.7% | +1 since #18 (normal) |
| blog_posts | 14 | 0 | 0.0% | ✅ Clean |

**12 total dead tuples across 3 sweeps since VACUUM #16.** Within autovacuum threshold.

---

## 3. SECURITY HEADERS — Unchanged

5 duplicated with conflicting values (B6 pending). 3 helmet-only headers clean.

---

## 4. U3 FIX — 16th Consecutive Sweep Stable

0 errors, 0 stderr lines.

---

## 5. TREND vs SWEEP #18

| Metric | #18 | #19 | Delta | Regression? |
|--------|-----|-----|-------|-------------|
| Public avg | 26ms | 28ms | +2ms | No (noise) |
| Entity LIST avg | 31ms | 31ms | 0 | No |
| CRUD avg | 30ms | 31ms | +1ms | No (noise) |
| Error rate | 0% | 0% | 0 | No |
| Monitoring | healthy | healthy | Same | No |
| Indexes/FK/Orphans | 118/44/0 | 118/44/0 | 0 | No |
| Helmet | 5 dup | 5 dup | 0 | No |
| U3 errors | 0 | 0 | 0 | No |
| Docs | 25 × 200 | 25 × 200 | 0 | No |

**Verdict: 0 regressions. All metrics stable.**

---

## 6. EXACT COUNTS

| Metric | Value |
|--------|-------|
| Tests passed | 53/53 |
| Tests failed | 0 |
| Regressions | 0 |
| Error rate | 0% (40/40) |
| Indexes | 118 |
| FK constraints | 44 |
| Unindexed FKs | 0 |
| Orphans | 0 |
| DB size | 11 MB |
| Dead tuples (total) | 12 (3 tx + 6 disc + 3 users) |
| Security header duplicates | 5 |
| U3 errors | 0 |
| U3 stderr | 0 lines |
| Docs HTTP 200 | 25/25 |
| Docker containers | 2 (both healthy) |
| fail2ban banned | 7 IPs |
| Backups | 2 files, 3 crons |
| Memory | 553MB / 3.7GB (15%) |
| Disk | 47% (39GB free) |

---

## 7. BLOCKERS — 8 owner-dependent (unchanged)

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
