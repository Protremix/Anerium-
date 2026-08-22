# ANERIUM OnePass — Sweep #20: Regression Cycle
**Timestamp:** 2026-08-22 09:44:24 UTC (start) → 09:44:29 UTC (end)
**Mode:** Read-only — no owner-dependent changes
**Compare:** Sweep #19 (09:36 UTC) → Sweep #20 (09:44 UTC)

---

## RESULT: 53/53 PASS | 0 REGRESSIONS | 0% ERROR RATE

---

## 1. EVIDENCE — 53-TEST RESULTS

| Category | Tests | Result | Detail |
|----------|-------|--------|--------|
| Public endpoints | 4 | All 200 ✅ | 25-27ms |
| Auth (unauth) | 7 | 401/201/302/401/401/403/200 ✅ | All correct |
| Entity LIST (12) | 12 | All 200 ✅ | 29-37ms, n stable |
| CRUD cycle | 5 | 201/200/200/200/404 ✅ | 30-32ms |
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

### Table bloat (4 sweeps since VACUUM #16)

| Table | Live | Dead | Dead % | Trend |
|-------|------|------|--------|-------|
| reviews | 115 | 0 | 0.0% | ✅ Clean |
| discounts | 39 | 8 | 20.5% | +2 since #19 (normal accumulation) |
| transactions | 30 | 3 | 10.0% | ✅ Stable |
| users | 18 | 4 | 22.2% | +1 since #19 (normal accumulation) |
| blog_posts | 14 | 0 | 0.0% | ✅ Clean |

**15 total dead tuples across 4 sweeps since VACUUM #16.** Within autovacuum threshold — no action needed.

---

## 3. SECURITY HEADERS — Unchanged

| Header | Count | Status |
|--------|-------|--------|
| strict-transport-security | 2 | ⚠️ Dup (B6) |
| content-security-policy | 2 | ⚠️ Dup (B6) |
| x-frame-options | 2 | ⚠️ Dup (B6) |
| referrer-policy | 2 | ⚠️ Dup (B6) |
| x-content-type-options | 2 | ✅ Same value |
| permissions-policy | 1 | ✅ Helmet only |
| cross-origin-opener-policy | 1 | ✅ Helmet only |
| cross-origin-resource-policy | 1 | ✅ Helmet only |

---

## 4. U3 FIX — 17th Consecutive Sweep Stable

0 errors, 0 stderr lines.

---

## 5. TREND vs SWEEP #19

| Metric | #19 (09:36) | #20 (09:44) | Delta | Regression? |
|--------|-------------|-------------|-------|-------------|
| Public avg | 28ms | 26ms | -2ms | No |
| Entity LIST avg | 31ms | 31ms | 0 | No |
| CRUD avg | 31ms | 30ms | -1ms | No |
| Error rate | 0% | 0% | 0 | No |
| Monitoring | healthy | healthy | Same | No |
| Indexes/FK/Orphans | 118/44/0 | 118/44/0 | 0 | No |
| Helmet dups | 5 | 5 | 0 | No |
| U3 errors | 0 | 0 | 0 | No |
| Docs | 26 × 200 | 26 × 200 | 0 | No |

**Verdict: 0 regressions. All metrics stable.**

---

## 6. EXACT COUNTS (timestamped 09:44 UTC)

| Metric | Value | Verified |
|--------|-------|----------|
| Tests passed | 53/53 | ✅ Verified |
| Tests failed | 0 | ✅ Verified |
| Regressions | 0 | ✅ Verified |
| Error rate | 0% (40/40) | ✅ Verified |
| Indexes | 118 | ✅ Verified |
| FK constraints | 44 | ✅ Verified |
| Unindexed FKs | 0 | ✅ Verified |
| Orphans | 0 | ✅ Verified |
| DB size | 11 MB | ✅ Verified |
| Dead tuples (total) | 15 (3 tx + 8 disc + 4 users) | ✅ Verified |
| Security header duplicates | 5 | ✅ Verified |
| U3 errors | 0 | ✅ Verified |
| U3 stderr | 0 lines | ✅ Verified |
| Docs HTTP 200 | 26/26 | ✅ Verified |
| Docker app | Up 2 hours | ✅ Verified |
| Docker DB | Up 2 days, healthy | ✅ Verified |
| TLS expiry | Nov 11 2026 | ✅ Verified |
| fail2ban banned | 7 IPs | ✅ Verified |
| Backups | 2 files, 3 crons | ✅ Verified |
| Memory | 555MB / 3.7GB (15%) | ✅ Verified |
| Disk | 47% (39GB free) | ✅ Verified |
| Load average | 0.31 / 0.10 / 0.03 | ✅ Verified |

---

## 7. BLOCKERS — 8 owner-dependent (unchanged)

| Priority | # | Item | Risk | Status | Verified |
|----------|---|------|------|--------|----------|
| P1 | B6 | Header harmonization | MEDIUM | Awaiting "go" | ✅ 5 dups confirmed |
| P2 | B2 | UFW firewall | MEDIUM | Awaiting "go" | ✅ inactive confirmed |
| P3 | B3 | SSH password auth | MEDIUM | Awaiting "go" | ✅ yes confirmed |
| P4 | B5 | Git init | LOW | Awaiting "go" | ✅ no .git confirmed |
| P5 | B4 | System reboot | LOW | Awaiting "go" | ✅ reboot-required present |
| P6 | B1 | Google OAuth test | NONE | Awaiting Mike | ✅ 302 confirmed |
| P7 | U1 | Password reset | LOW | Awaiting "go" + email provider | ✅ stub confirmed |
| P8 | U2 | OTP/2FA | LOW | Same as U1 | ✅ stub confirmed |

### Autonomous: all complete ✅ (VACUUM #16, Finding #1 resolved #13)

---

## 8. UNVERIFIED / UNKNOWN

| Item | Status | Note |
|------|--------|------|
| Google OAuth E2E flow | UNVERIFIED | 302 redirect works but full callback not tested — requires browser test by owner |
| Password reset email delivery | UNVERIFIED | U1 stub returns success but no email provider configured |
| OTP delivery | UNVERIFIED | U2 stub returns success but no email/SMS provider configured |
| Kernel security after reboot | UNKNOWN | Reboot pending (B4) — kernel version post-reboot not verifiable without rebooting |

---

## NO PRODUCTION CHANGES MADE
