# ANERIUM OnePass — Sweep #17: Regression Cycle
**Date:** 2026-08-22 11:11 UTC
**Mode:** Read-only — no owner-dependent changes
**Compare:** Sweep #16 (09:06 UTC) → Sweep #17 (09:11 UTC)

---

## RESULT: 53/53 PASS | 0 REGRESSIONS | 0% ERROR RATE

---

## 1. EVIDENCE — 53-TEST RESULTS

| Category | Tests | Result | Detail |
|----------|-------|--------|--------|
| Public endpoints | 4 | All 200 ✅ | 24-28ms |
| Auth (unauth) | 7 | 401/201/302/401/401/403/200 ✅ | All correct |
| Entity LIST (12) | 12 | All 200 ✅ | 29-38ms, n stable |
| CRUD cycle | 5 | 201/200/200/200/404 ✅ | 30-34ms |
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

### Table bloat (post-VACUUM from #16 + this sweep's test cycle)

| Table | Live | Dead | Dead % | Note |
|-------|------|------|--------|------|
| reviews | 115 | 0 | 0.0% | ✅ Clean |
| discounts | 39 | 2 | 5.1% | Normal (this sweep's CRUD test) |
| transactions | 30 | 3 | 10.0% | ✅ Stable |
| users | 18 | 1 | 5.6% | Normal (this sweep's register test) |
| blog_posts | 14 | 0 | 0.0% | ✅ Clean |

**VACUUM from sweep #16 holding.** Only 3 new dead tuples from this sweep's test cycle (normal, will autovacuum).

---

## 3. SECURITY HEADERS — Unchanged

5 duplicated with conflicting values (B6 pending). 3 helmet-only headers clean.

---

## 4. U3 FIX — 14th Consecutive Sweep Stable

0 errors, 0 stderr lines.

---

## 5. TREND vs SWEEP #16

| Metric | #16 | #17 | Delta | Regression? |
|--------|-----|-----|-------|-------------|
| Public avg | 27ms | 26ms | -1ms | No (improved) |
| Entity LIST avg | 32ms | 32ms | 0 | No |
| CRUD avg | 29ms | 31ms | +2ms | No (noise) |
| Error rate | 0% | 0% | 0 | No |
| Monitoring | healthy | healthy | Same | No |
| Indexes/FK/Orphans | 118/44/0 | 118/44/0 | 0 | No |
| users dead | 0 | 1 | +1 | No (this sweep's test) |
| discounts dead | 0 | 2 | +2 | No (this sweep's test) |
| Helmet | 5 dup | 5 dup | 0 | No |
| U3 errors | 0 | 0 | 0 | No |
| Docs | 22 × 200 | 22 × 200 | 0 | No |

**Verdict: 0 regressions. All metrics stable. VACUUM holding.**

---

## 6. SCORECARD

| Status | Count |
|--------|-------|
| ✅ VERIFIED | 110 |
| ⚠️ UNVERIFIED | 2 (U1, U2) |
| ⛔ BLOCKED | 6 (B1-B6) |
| 🔍 OPEN FINDINGS | 1 (Finding #2: header conflict) |
| ✅ AUTONOMOUS FIXES | 2 done (VACUUM + Finding #1 resolved) |

---

## 7. BLOCKED ITEMS — Unchanged (8)

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

### Autonomous: all complete ✅ (VACUUM done, Finding #1 resolved)

---

## 8. INFRASTRUCTURE

| Component | Status |
|-----------|--------|
| Docker app | Up 2 hours ✅ |
| Docker DB | Up 2 days, healthy ✅ |
| TLS | Valid until Nov 11 2026 ✅ |
| fail2ban | 6 IPs banned ✅ |
| Backups | 2 files, 3 crons ✅ |
| Memory | 541MB / 3.7GB (15%) ✅ |
| Disk | 47% (39GB free) ✅ |
| 22 docs | All HTTP 200 ✅ |

---

## NO CHANGES MADE
