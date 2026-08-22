# ANERIUM OnePass — Owner Decision Package
**Version:** 2.0 — Consolidated
**Date:** 2026-08-22 10:06 CET
**Evidence:** Sweep #6, 08:06 UTC — 53/53 tests pass, 0 regressions
**Score:** 109 verified / 2 unverified / 6 blocked
**Rule:** No auth changes without owner "go"

---

## SUMMARY — 8 decisions pending

| # | Item | Mike says | Brio does | Time | Downtime | Risk | Reversible |
|---|------|----------|-----------|------|----------|------|------------|
| B1 | Google OAuth browser test | "test OAuth" | Nothing (Mike uses browser) | 2 min | 0 | Zero | N/A |
| B2 | UFW firewall | "go" | Enable 3 rules | 30 sec | 0 | Low | Yes |
| B3 | SSH password auth | "go" | Disable password login | 30 sec | 0 | Medium | Yes |
| B4 | System reboot | "go" | `reboot` | 2 min | 2 min | Low | Auto-recovers |
| B5 | Git init | "go" | `git init` + commit | 1 min | 0 | Zero | Yes |
| B6 | Header harmonization | "go" | Disable 4 dup helmet headers | 10 min | 0 | Low | Yes |
| U1 | Password reset | "go" + choose email provider | Implement 3 endpoints | 40 min | ~3 sec | Low | Yes |
| U2 | OTP | "go" (same as U1) | Implement 2 endpoints | included | included | Low | Yes |

**If approving all:** Total ~58 min. Recommended order: B5 → B2 → B3 → B6 → B4 → B1 → U1/U2.

---

## B1: Google OAuth Browser E2E

| Field | Value |
|-------|-------|
| **Prerequisite** | 3 redirect URIs must be in Google Cloud Console. Credentials SET. Server returns 302 → accounts.google.com. |
| **What's ready** | ✅ GOOGLE_CLIENT_ID (44 chars), ✅ GOOGLE_CLIENT_SECRET (35 chars), ✅ start endpoint 302, ✅ callback routes exist |
| **What's missing** | Browser test with real Google account — can't automate |
| **Owner action** | Open `https://anerium.com`, click "Sign in with Google", verify profile loads |
| **If fails** | `redirect_uri_mismatch` → add URIs to Google Console → Credentials → OAuth Client (see anerium.com/google-oauth-setup.md) |
| **Rollback** | N/A — no system changes |
| **Verify** | `curl -H "Authorization: Bearer <JWT>" /entities/User/me` → 200 |

---

## B2: UFW Firewall

| Field | Value |
|-------|-------|
| **Prerequisite** | UFW installed. Only 3 ports exposed: 22/80/443. Docker binds 3001/5432 to localhost. |
| **Current state** | Status: inactive (all ports open, but Docker already binds to localhost) |
| **Owner action** | Say "go" → Brio runs: `ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable` |
| **Rollback** | `ufw disable` — instant |
| **Verify** | `ufw status` shows 3 rules; SSH works; `curl /health` → 200; port 3001 externally unreachable |

---

## B3: Disable SSH Password Auth

| Field | Value |
|-------|-------|
| **Prerequisite** | 1 SSH key in authorized_keys (confirmed working). Hetzner web console = fallback. |
| **Current state** | PasswordAuthentication yes, 1 key present, 7 IPs banned by fail2ban (203 failed attempts) |
| **Owner action** | Say "go" → Brio runs: `sed -i 's/yes/no/' sshd_config && systemctl restart sshd` |
| **Rollback** | `sed -i 's/no/yes/' sshd_config && systemctl restart sshd` (or Hetzner console) |
| **Verify** | Key SSH works; `ssh -o PubkeyAuthentication=no` → denied; grep shows `PasswordAuthentication no` |

---

## B4: System Reboot

| Field | Value |
|-------|-------|
| **Prerequisite** | `/var/run/reboot-required` exists. Kernel 5.15.0-187. Docker restart: always. Caddy systemd-managed. |
| **Current state** | Reboot required: YES. Uptime: 9 days. All services have auto-restart. |
| **Owner action** | Say "go" → Brio runs: `reboot` |
| **Rollback** | N/A — system auto-recovers (all services restart on boot) |
| **Verify** | `uptime` fresh; `docker ps` both running; `curl /health` → 200; `uname -r` updated |

---

## B5: Git Version Control

| Field | Value |
|-------|-------|
| **Prerequisite** | Git installed. No existing repo. 11 JS files in src/. |
| **Current state** | No .git directory. No version tracking. |
| **Owner action** | Say "go" → Brio runs: `git init && git add -A && git commit -m "production baseline"` |
| **Rollback** | `rm -rf .git` — no code lost |
| **Verify** | `git log` shows 1 commit; `git status` clean; `.env` not tracked |

---

## B6: Header Harmonization

| Field | Value |
|-------|-------|
| **Prerequisite** | 5 headers duplicated (Caddy + helmet). Caddy values match app needs (allows inline scripts). Helmet defaults too restrictive. |
| **Current state** | HSTS: 2, CSP: 2, X-Frame-Options: 2, Referrer-Policy: 2, X-Content-Type-Options: 2 |
| **Owner action** | Say "go" → Brio disables 4 headers in helmet config, rebuilds Docker |
| **Rollback** | Revert app.js to `app.use(helmet())`, rebuild |
| **Verify** | Each header appears exactly once; `curl /` → 200; `curl /directory` → 200 |

---

## U1: Password Reset (3 endpoints — currently stubs)

| Field | Value |
|-------|-------|
| **Current behavior** | All 3 return `{"success":true}` without doing anything — no DB lookup, no token, no email |
| **Affected endpoints** | reset-password-request, reset-password, change-password |
| **DB ready** | ✅ `users` table has `password_hash` field. `password_reset_tokens` table needs CREATE (or use stateless JWT) |
| **Missing** | Email service (no nodemailer/resend/sendgrid installed, no SMTP env vars) |
| **Owner action** | 1. Choose email provider (Resend recommended — free 3,000/mo, 1 npm package, 1 env var). 2. Provide API key. 3. Say "go" |
| **Implementation** | Brio writes ~150 lines across 3 endpoints: token generation, email sending, password update, validation |
| **Time** | ~25 min (code + test + rebuild) |
| **Rollback** | Restore auth.js.bak, rebuild (~5 min) |
| **Full spec** | anerium.com/U1_U2_IMPLEMENTATION_PACKAGE.md (18KB) |

---

## U2: OTP (2 endpoints — currently stubs)

| Field | Value |
|-------|-------|
| **Current behavior** | Both return `{"success":true}` without doing anything — no OTP validation, no generation |
| **Affected endpoints** | verify-otp, resend-otp |
| **DB ready** | ✅ `otp_codes` table exists (12 columns, 0 records) — ready for use |
| **Missing** | Same email service as U1 (for email-based OTP), or Twilio for SMS |
| **Owner action** | Same as U1 — choosing email provider enables both U1 and U2 |
| **Implementation** | Brio writes ~80 lines across 2 endpoints: code generation, hash+store, verify, rate-limit attempts |
| **Time** | ~15 min (included with U1) |
| **Rollback** | Same as U1 |
| **Full spec** | anerium.com/U1_U2_IMPLEMENTATION_PACKAGE.md (18KB) |

---

## EVIDENCE — SWEEP #6 (08:06 UTC)

### 53/53 tests passed

| Category | Tests | Pass |
|----------|-------|------|
| Public endpoints | 4 | 4 ✅ |
| Auth (unauthenticated) | 7 | 7 ✅ |
| Entity LIST (12 tables) | 12 | 12 ✅ |
| Full CRUD cycle | 5 | 5 ✅ |
| User/me + rate limit + monitoring | 3 | 3 ✅ |
| U3 reconfirmation | 5 | 5 ✅ |
| U1/U2 stub confirmation | 4 | 4 ✅ |
| Blocked items status | 6 | 6 ✅ |
| Infrastructure | 4 | 4 ✅ |
| Docs (14 files) | 3 | 3 ✅ |
| **Total** | **53** | **53** |

### U3 Fix — Confirmed Stable (3rd consecutive sweep)

| Check | Result |
|-------|--------|
| Default values in script | `CRITICAL_COUNT=${CRITICAL_COUNT:-0}` ✅ |
| Integer expression errors in log | 0 ✅ |
| Latest health log entries | Clean, timestamped, no errors ✅ |
| Old stderr log | 0 lines ✅ |
| Script modification time | 2026-08-22 07:52:44 (fix from sweep #4) ✅ |

### System State

| Metric | Value |
|--------|-------|
| Docker app | Up 38 min, restart: always ✅ |
| Docker DB | Up 2 days, healthy ✅ |
| Monitoring | healthy, 0 alerts, 22 endpoints ✅ |
| TLS | Valid until Nov 11 2026 ✅ |
| fail2ban | 7 IPs banned, 203 failed ✅ |
| Memory | 533MB / 3.7GB (14%) ✅ |
| Disk | 47% (39GB free) ✅ |
| Backups | 2 files, 1 backup cron, 1 restore cron ✅ |
| 14 docs | All HTTP 200 ✅ |
