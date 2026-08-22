# ANERIUM OnePass — Regression Sweep #4 Report
**Date:** 2026-08-22 09:54 CET
**Mode:** Read-only + safe script fix (U3)
**Server:** 178.104.121.35

---

## UPDATED SCORECARD

| | Before Sweep #4 | After Sweep #4 | Change |
|---|---|---|---|
| ✅ VERIFIED | 108 | **109** | +1 (U3 fixed) |
| ⚠️ UNVERIFIED | 3 | **2** | -1 (U3 resolved) |
| ⛔ BLOCKED | 6 | **6** | No change |

---

## REGRESSION RESULTS — 0 failures

### Entity CRUD (12 tables + full CRUD cycle)

| Test | Result |
|------|--------|
| Entity LIST (12 tables) | All 200 with real data ✅ |
| CREATE (discounts) | 201, id returned ✅ |
| GET by ID | 200, correct data ✅ |
| UPDATE (PUT) | 200, fields updated ✅ |
| DELETE | 200 ✅ |
| GET deleted → 404 | Confirms deletion ✅ |
| User/me | 200 ✅ |

### Auth + Rate Limiting

| Test | Result |
|------|--------|
| Login (invalid) | 401 ✅ |
| Register | 201 ✅ |
| Google OAuth start | 302 → accounts.google.com ✅ |
| No token | 401 ✅ |
| Fake JWT | 401 ✅ |
| Monitoring (external) | 403 ✅ |
| Rate limit headers | 1000/min API, 100/min auth ✅ |

### Infrastructure

| Check | Result |
|-------|--------|
| Public endpoints (4) | All 200, 24-32ms ✅ |
| Monitoring | healthy, 0 alerts ✅ |
| Backups | 2 files, 3 crons active ✅ |
| 11 docs | All HTTP 200 ✅ |
| Docker | Both running, restart: always ✅ |
| TLS | Valid until Nov 11 2026 ✅ |
| fail2ban | 8 IPs banned, 178 failed ✅ |
| Memory | 532MB / 3.7GB ✅ |
| Disk | 47% (39GB free) ✅ |
| Security headers | 5 duplicated (B6), 1 single ✅ |

---

## UNVERIFIED ITEMS — DETAILED FINDINGS

### U1: Password Reset — STUB (not functional)

| Aspect | Finding |
|--------|---------|
| **Endpoint** | POST /auth/reset-password-request → 200 |
| **Response** | `{"success":true,"message":"If the email exists, a reset link has been sent."}` |
| **Implementation** | **STUB** — returns hardcoded success, no DB lookup, no token generation, no email sent |
| **Same for** | /auth/reset-password (returns `{"success":true}`), /auth/change-password (returns `{"success":true}`) |
| **SMTP** | Not configured — no nodemailer, sendgrid, mailgun, or SES in package.json or .env |
| **Security note** | Always returns success — user receives no feedback that email was NOT sent |
| **Status** | ⚠️ UNVERIFIED — endpoint exists but is a placeholder, not functional |
| **To verify** | Implement password reset logic + configure SMTP service |

### U2: OTP Verify/Resend — STUB (not functional)

| Aspect | Finding |
|--------|---------|
| **Endpoint** | POST /auth/verify-otp → 200, POST /auth/resend-otp → 200 |
| **Response** | Both return `{"success":true}` regardless of input |
| **Implementation** | **STUB** — no OTP validation, no session token check, no OTP generation/resend |
| **Security note** | Always returns success — any OTP input is "accepted" |
| **Status** | ⚠️ UNVERIFIED — endpoint exists but is a placeholder, not functional |
| **To verify** | Implement OTP generation, delivery, and validation logic |

### U3: Health Check Script — FIXED ✅

| Aspect | Finding |
|--------|---------|
| **Bug** | Lines 43/54: `[: : integer expression expected` when CRITICAL_COUNT/WARNING_COUNT empty |
| **Root cause** | python3 parse failure left variables empty, bash `-gt` comparison on empty string |
| **Fix** | Added `CRITICAL_COUNT=${CRITICAL_COUNT:-0}` and `WARNING_COUNT=${WARNING_COUNT:-0}` |
| **Verification** | `bash -x` trace confirms: `CRITICAL_COUNT=` → `CRITICAL_COUNT=0` (no error). `/var/log/anerium-health.log` shows 0 integer-expression errors. Old stderr log truncated. |
| **Backup** | `/opt/anerium/scripts/health-check.sh.bak` |
| **Status** | ✅ VERIFIED (was UNVERIFIED → now FIXED + VERIFIED) |

---

## BLOCKED ITEMS (6 — unchanged)

| # | Blocker | Owner action | Time | Reversible |
|---|---------|-------------|------|------------|
| B1 | Google OAuth browser test | Mike opens browser | 2 min | N/A |
| B2 | UFW firewall | Say "go" | 30 sec | Yes |
| B3 | SSH password auth | Say "go" | 30 sec | Yes |
| B4 | System reboot | Say "go" | 2 min | Auto-recovers |
| B5 | Git init | Say "go" | 1 min | Yes |
| B6 | Header harmonization | Say "go" | 10 min | Yes |

---

## NEW FINDING: Stub Auth Endpoints

Three auth endpoint groups are stubs returning hardcoded success without actual functionality:

| Endpoint | Returns | Does NOT do |
|----------|---------|-------------|
| reset-password-request | `{"success":true}` | No DB lookup, no token, no email |
| reset-password | `{"success":true}` | No token validation, no DB update |
| change-password | `{"success":true}` | No current password check, no DB update |
| verify-otp | `{"success":true}` | No OTP validation |
| resend-otp | `{"success":true}` | No OTP generation/resend |

**Risk:** Users attempting password reset or OTP verification will receive success responses but nothing actually happens. This is a development gap, not a security vulnerability (stubs don't expose data or allow bypass).

**Recommendation:** Implement these endpoints with proper logic + SMTP/OTP service before relying on them in production. Email/password login and Google OAuth are fully functional.
