# ANERIUM OnePass — Owner-Approval Package: U1 (Password Reset) + U2 (OTP)
**Version:** 1.0
**Date:** 2026-08-22 09:55 CET
**Prepared by:** Brio (Superagent)
**Classification:** Internal — Requires Owner Approval Before Implementation
**Status:** NOT IMPLEMENTED — awaiting owner "go"

---

## 1. CURRENT STUB BEHAVIOR

Five auth endpoints in `/opt/anerium/src/routes/auth.js` (lines 156-178) are stubs — they return hardcoded `{"success":true}` without performing any actual logic.

### Affected Endpoints

| Endpoint | Line | Current Response | What It Does | What It Should Do |
|----------|------|-------------------|-------------|-------------------|
| POST /auth/reset-password-request | 157 | `{success:true, message:"If the email exists..."}` | Nothing | Look up user, generate token, send email |
| POST /auth/reset-password | 162 | `{success:true}` | Nothing | Verify token, update password in DB |
| POST /auth/change-password | 167 | `{success:true}` | Nothing | Verify current password, update in DB |
| POST /auth/verify-otp | 172 | `{success:true}` | Nothing | Validate OTP code against DB, mark verified |
| POST /auth/resend-otp | 177 | `{success:true}` | Nothing | Generate new OTP, store in DB, send via SMS/email |

### Current Code (lines 156-178)

```javascript
// POST /api/apps/:appId/auth/reset-password-request
router.post('/apps/:appId/auth/reset-password-request', async (req, res) => {
  res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
});

// POST /api/apps/:appId/auth/reset-password
router.post('/apps/:appId/auth/reset-password', async (req, res) => {
  res.json({ success: true });
});

// POST /api/apps/:appId/auth/change-password
router.post('/apps/:appId/auth/change-password', async (req, res) => {
  res.json({ success: true });
});

// POST /api/apps/:appId/auth/verify-otp
router.post('/apps/:appId/auth/verify-otp', async (req, res) => {
  res.json({ success: true });
});

// POST /api/apps/:appId/auth/resend-otp
router.post('/apps/:appId/auth/resend-otp', async (req, res) => {
  res.json({ success: true });
});
```

---

## 2. SECURITY IMPACT

### Risk of Stubs (current state)

| Risk | Level | Assessment |
|------|-------|------------|
| Data leak | NONE | Stubs don't read or return user data |
| Auth bypass | NONE | Stubs don't grant access or tokens |
| False sense of security | MEDIUM | Users see "success" but nothing happens — password not reset, OTP not validated |
| User confusion | MEDIUM | User tries to reset password, gets success message, but can't log in with new password |

### Risk of Implementation (if approved)

| Risk | Level | Mitigation |
|------|-------|------------|
| Reset token interception | LOW | Tokens expire in 1 hour, single-use, hashed in DB |
| Email enumeration | NONE | Same response regardless of email existence |
| OTP brute force | LOW | Max 5 attempts, 10-min expiry, rate-limited |
| Password complexity | LOW | Minimum 8 chars enforced server-side |
| Token reuse | NONE | Tokens marked as used after reset, checked on each request |
| SMTP credentials leak | NONE | Stored in .env, never in responses, not in git (post B5) |

### Security Requirements for Implementation

1. **Reset tokens:** JWT with 1-hour expiry, single-use, jti stored in DB as hash
2. **OTP codes:** 6-digit, 10-minute expiry, max 5 verification attempts, max 3 resends per 15 minutes
3. **No email enumeration:** reset-password-request returns same response for existing and non-existing emails
4. **Password policy:** minimum 8 characters, must differ from current (for change-password)
5. **Rate limiting:** already in place (100/min per IP for auth endpoints)
6. **Audit trail:** log reset/OTP events to existing `audit_logs` table

---

## 3. EXISTING INFRASTRUCTURE

### Already in Place

| Component | Status | Details |
|-----------|--------|---------|
| JWT (jsonwebtoken ^9.0.2) | ✅ Ready | Can generate short-lived reset tokens |
| bcryptjs (^2.4.3) | ✅ Ready | Hash new passwords |
| Rate limiting (express-rate-limit ^7.4.0) | ✅ Ready | 100/min per IP on auth routes |
| `otp_codes` table | ✅ Ready | 12 columns: id, user_id, phone_number, code_hash, delivery_method, expires_at, attempts, verified, etc. 0 records. |
| `sessions` table | ✅ Ready | 13 columns: id, user_id, token_hash, device_info, ip_address, expires_at, is_active, etc. 0 records. |
| `audit_logs` table | ✅ Ready | For security event logging |
| `users` table | ✅ Ready | Has password_hash, email, is_active fields |

### Not in Place (needs to be added)

| Component | Required for | Options |
|-----------|-------------|---------|
| SMTP/email service | U1: send reset email | Resend (simplest), SendGrid, AWS SES, Gmail SMTP |
| `password_reset_tokens` table | U1: track reset tokens | New table OR reuse JWT tokens (stateless) |
| SMS service (optional) | U2: send OTP via SMS | Twilio, AWS SNS — or use email for OTP delivery |
| nodemailer (or SDK) | U1+U2: email delivery | npm package |

### .env Keys (currently set)

```
DB_PASSWORD, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, OPENAI_PROJECT_KEY
```

### .env Keys to Add (after owner chooses provider)

```
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
# OR for Resend:
RESEND_API_KEY, FROM_EMAIL
# OR for SendGrid:
SENDGRID_API_KEY, FROM_EMAIL
```

---

## 4. IMPLEMENTATION REQUIREMENTS

### U1: Password Reset (3 endpoints)

#### 4.1.1 POST /auth/reset-password-request

**Request:** `{ email }`

**Logic:**
1. Validate email format
2. Look up user by email (lowercase)
3. If user exists:
   a. Generate reset JWT (userId, jti, type: "password_reset", exp: 1 hour)
   b. Store jti hash in `password_reset_tokens` table (or use stateless JWT)
   c. Send email with link: `https://anerium.com/reset-password?token=<JWT>`
4. Always return: `{ success: true, message: "If the email exists, a reset link has been sent." }`

**New table needed:**
```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);
```

**Alternative (stateless, no table):** Use JWT with 1-hour expiry. Simpler but can't revoke tokens or track usage. Recommended for MVP.

#### 4.1.2 POST /auth/reset-password

**Request:** `{ token, newPassword }`

**Logic:**
1. Verify JWT (token, JWT_SECRET) — check expiry, type === "password_reset"
2. If using table: check token not already used
3. Validate password (min 8 chars)
4. Hash password (bcrypt, 10 rounds)
5. Update users SET password_hash = hash WHERE id = userId
6. If using table: mark token as used
7. Revoke all existing sessions for user (optional, security best practice)
8. Log to audit_logs
9. Return: `{ success: true, message: "Password updated successfully" }`

**Error cases:**
- 400: missing token or password
- 401: invalid or expired token
- 400: password too short
- 410: token already used (if using table)

#### 4.1.3 POST /auth/change-password

**Request:** `{ currentPassword, newPassword }` + `Authorization: Bearer <JWT>`

**Logic:**
1. Verify auth token (existing middleware)
2. Get user from DB
3. Verify current password (bcrypt.compare)
4. Validate new password (min 8 chars, different from current)
5. Hash and update in DB
6. Log to audit_logs
7. Return: `{ success: true, message: "Password changed successfully" }`

**Error cases:**
- 401: no auth token
- 400: missing passwords
- 401: current password incorrect
- 400: new password too short or same as current

---

### U2: OTP (2 endpoints)

#### 4.2.1 POST /auth/verify-otp

**Request:** `{ sessionToken, code }` (sessionToken = pending OTP session ID)

**Logic:**
1. Look up OTP record by sessionToken in `otp_codes` table
2. If not found: return 401 `{ error: "Invalid or expired session" }`
3. If already verified: return 400 `{ error: "OTP already used" }`
4. If expired (expires_at < NOW()): return 401 `{ error: "OTP expired" }`
5. If attempts >= 5: return 429 `{ error: "Too many attempts" }`
6. Verify code (bcrypt.compare(code, code_hash))
7. If incorrect: increment attempts, return 401 `{ error: "Invalid code" }`
8. If correct: mark verified = true, return `{ success: true, message: "OTP verified" }`

#### 4.2.2 POST /auth/resend-otp

**Request:** `{ sessionToken }` or `{ phoneNumber }`

**Logic:**
1. Check resend rate limit (max 3 per 15 minutes — use in-memory counter or DB)
2. Generate 6-digit random code
3. Hash code (bcrypt)
4. Insert into `otp_codes` table: (user_id, phone_number, code_hash, delivery_method, expires_at=NOW()+10min, attempts=0, verified=false)
5. Send code via SMS (Twilio) or email (SMTP)
6. Return: `{ success: true, message: "OTP sent", sessionToken: <new_id> }`

**New dependency:** SMS gateway (Twilio) OR reuse email service for email-based OTP

---

## 5. DEPENDENCY MATRIX

### Option A: Resend (recommended — simplest email API)

| Dependency | Version | Purpose |
|-----------|---------|---------|
| resend | ^2.0.0 | Email delivery (reset links, OTP) |
| RESEND_API_KEY | .env | API key |
| FROM_EMAIL | .env | e.g. "noreply@anerium.com" |

**Cost:** Free tier = 3,000 emails/month, 100 emails/day

### Option B: Nodemailer + SMTP (most flexible)

| Dependency | Version | Purpose |
|-----------|---------|---------|
| nodemailer | ^6.9.0 | SMTP client |
| SMTP_HOST/PORT/USER/PASS | .env | SMTP credentials |

**Cost:** Depends on provider (Gmail free, AWS SES $0.10/1000, etc.)

### Option C: SendGrid (enterprise-grade)

| Dependency | Version | Purpose |
|-----------|---------|---------|
| @sendgrid/mail | ^8.0.0 | Email delivery |
| SENDGRID_API_KEY | .env | API key |

**Cost:** Free tier = 100 emails/day

### OTP Delivery Options

| Method | Requires | Cost |
|--------|----------|------|
| Email-based OTP | Same email service as U1 | Free with any email provider |
| SMS-based OTP | Twilio account + TWILIO_* env vars | ~$0.0079/SMS |
| WhatsApp OTP (via Twilio) | Twilio + WhatsApp Business | ~$0.005/message |

**Recommendation:** Email-based OTP for MVP (no extra dependency). Add SMS via Twilio later if needed.

---

## 6. TEST PLAN

### Pre-deployment Tests (run locally before building)

| # | Test | Expected | Method |
|---|------|----------|--------|
| T1 | reset-password-request with valid email | 200, `{success:true}` | curl |
| T2 | reset-password-request with invalid email | 200, same response | curl |
| T3 | reset-password-request with missing email | 400, `{error:"Email required"}` | curl |
| T4 | reset-password with valid token | 200, `{success:true}` | curl |
| T5 | reset-password with expired token | 401, `{error:"Invalid or expired token"}` | curl |
| T6 | reset-password with short password | 400, `{error:"Password too short"}` | curl |
| T7 | reset-password with missing fields | 400 | curl |
| T8 | change-password with correct current | 200 | curl + JWT |
| T9 | change-password with wrong current | 401 | curl + JWT |
| T10 | change-password without auth | 401 | curl |
| T11 | verify-otp with correct code | 200, `{success:true}` | curl |
| T12 | verify-otp with wrong code | 401, attempts incremented | curl |
| T13 | verify-otp with expired | 401 | curl |
| T14 | verify-otp 6th attempt | 429, `{error:"Too many attempts"}` | curl loop |
| T15 | resend-otp | 200, new sessionToken | curl |
| T16 | resend-otp 4th time in 15 min | 429, `{error:"Too many requests"}` | curl loop |
| T17 | Token single-use (use twice) | 401 on second use | curl |
| T18 | Password not leaked in any response | No password_hash in response | grep |

### Post-deployment Tests (run after Docker rebuild)

| # | Test | Expected |
|---|------|----------|
| T19 | All existing endpoints still work | Same as sweep #4 results |
| T20 | Rate limiting still active | Headers present |
| T21 | Monitoring still healthy | 0 alerts after reset |
| T22 | Docker containers stable | Both running |

### Regression Test (non-destructive)

After implementation, re-run the full sweep #4 test suite to confirm:
- All 12 entity LIST endpoints: 200
- Full CRUD cycle: 201/200/200/200
- Auth (login/register/logout): unchanged
- Google OAuth start: 302
- Rate limiting: 1000/min API, 100/min auth
- Monitoring: healthy, 0 alerts

---

## 7. ROLLOUT PLAN

### Phase 1: Pre-deployment (no production changes)

| Step | Action | Duration | Reversible |
|------|--------|----------|------------|
| 1.1 | Add email dependency to package.json | 30 sec | Yes (revert) |
| 1.2 | Add SMTP/API key to .env | 30 sec | Yes (remove key) |
| 1.3 | Write implementation code in auth.js | 15 min | Yes (git revert after B5, or .bak) |
| 1.4 | Create password_reset_tokens table (if using table approach) | 30 sec | Yes (DROP TABLE) |
| 1.5 | Add email templates (reset link, OTP code) | 10 min | Yes (revert) |

### Phase 2: Deployment (with owner approval)

| Step | Action | Duration | Downtime |
|------|--------|----------|----------|
| 2.1 | Backup current code + DB | 1 min | 0 |
| 2.2 | Docker compose build app | 2 min | 0 (old container still running) |
| 2.3 | Docker compose up -d app | 5 sec | ~3 sec (container restart) |
| 2.4 | Run pre-deployment tests (T1-T18) | 2 min | 0 |
| 2.5 | Run regression tests (T19-T22) | 2 min | 0 |
| 2.6 | Verify monitoring | 30 sec | 0 |

### Phase 3: Post-deployment verification

| Step | Action | Duration |
|------|--------|----------|
| 3.1 | Send real reset email to owner's email | 1 min |
| 3.2 | Verify email received with reset link | 1 min |
| 3.3 | Complete full reset flow (click link, set new password) | 2 min |
| 3.4 | Login with new password | 30 sec |
| 3.5 | Test OTP flow (if SMS not available, skip) | 2 min |

**Total estimated time: 40 minutes** (including coding + deployment + testing)

---

## 8. ROLLBACK PLAN

### If implementation fails or causes issues:

| Step | Action | Command | Time |
|------|--------|---------|------|
| R1 | Restore auth.js from backup | `cp /opt/anerium/src/routes/auth.js.bak /opt/anerium/src/routes/auth.js` | 5 sec |
| R2 | Rebuild Docker image | `docker compose build app` | 2 min |
| R3 | Restart container | `docker compose up -d app` | 5 sec |
| R4 | Drop new table (if created) | `docker exec anerium-db-1 psql -U anerium -d anerium -c "DROP TABLE IF EXISTS password_reset_tokens;"` | 2 sec |
| R5 | Remove new env vars | Edit .env, remove SMTP_* keys | 10 sec |
| R6 | Remove npm dependency | Edit package.json, rebuild | 2 min |
| R7 | Verify system restored | Run regression sweep | 2 min |

**Total rollback time: ~5 minutes** (excluding Docker rebuild)

### Partial Rollback (keep OTP, revert only password reset)

If only password reset is problematic, revert just those 3 endpoints to stubs and keep OTP implementation. This is possible because the endpoints are independent.

---

## 9. ENVIRONMENT VARIABLES TO ADD

### After owner chooses email provider, add to .env:

```bash
# Resend (recommended):
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@anerium.com

# OR Nodemailer + SMTP:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=anerium@gmail.com
SMTP_PASS=xxxxxxxxxxxx
FROM_EMAIL=noreply@anerium.com

# OR SendGrid:
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
FROM_EMAIL=noreply@anerium.com
```

### For SMS OTP (optional, not required for MVP):

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 10. APPROVAL DECISION MATRIX

| Decision | What Brio does | Time | Risk |
|----------|---------------|------|------|
| "Implement U1 + U2 with Resend" | Full implementation + email-based OTP | 40 min | Low |
| "Implement U1 only" | Password reset only, OTP stays stub | 25 min | Low |
| "Implement U2 only" | OTP only, password reset stays stub | 20 min | Low |
| "Implement U1 + U2 with SMS" | Password reset + SMS OTP (Twilio) | 45 min | Low |
| "Not now" | Keep stubs, document as known gap | 0 min | Status quo |
| "Plan only" | No code changes, keep this document as roadmap | 0 min | Zero |

### Prerequisites for Any Implementation

1. Owner chooses email provider (Resend recommended)
2. Owner provides API key / SMTP credentials
3. Owner approves adding npm dependency
4. Owner approves Docker image rebuild
5. B5 (git init) recommended first for rollback safety

---

## 11. EVIDENCE — REGRESSION SWEEP #4 STATUS (current)

### System state as of 07:55 UTC (2026-08-22)

| Check | Result |
|-------|--------|
| GET /health | 200, 35ms ✅ |
| GET / | 200, 26ms ✅ |
| GET /auth/google/start | 302 ✅ |
| anerium-app-1 | Up 27 min, restart: always ✅ |
| anerium-db-1 | Up 2 days, healthy ✅ |

### Scorecard

| Status | Count | Items |
|--------|-------|-------|
| ✅ VERIFIED | 109 | All endpoints, auth, entity CRUD, rate limiting, monitoring, backups, docs, security, infrastructure |
| ⚠️ UNVERIFIED | 2 | U1: password reset (stub), U2: OTP (stub) |
| ⛔ BLOCKED | 6 | B1: OAuth browser test, B2: UFW, B3: SSH, B4: reboot, B5: git init, B6: headers |

### DB Infrastructure (ready for implementation)

| Table | Records | Status |
|-------|---------|--------|
| users | 17 | ✅ Ready (has password_hash, email) |
| otp_codes | 0 | ✅ Ready (12 columns, proper schema) |
| sessions | 0 | ✅ Ready (13 columns, proper schema) |
| audit_logs | — | ✅ Ready (for security event logging) |
| password_reset_tokens | N/A | ❌ Does not exist (needs CREATE TABLE) |

### Auth Code Architecture

| Component | File | Status |
|-----------|------|--------|
| JWT generation | auth.js:63 | ✅ generateToken(userId) with jti |
| Token verification | auth.js:47 | ✅ verifyToken with blacklist check |
| Password hashing | auth.js:73 | ✅ hashPassword (bcrypt, 10 rounds) |
| Password verification | auth.js:77 | ✅ verifyPassword (bcrypt.compare) |
| Token revocation | auth.js:25 | ✅ revokeToken (in-memory blacklist) |
| Rate limiting | app.js | ✅ 100/min auth, 1000/min API |
| Login | auth.js:58 | ✅ Fully implemented |
| Register | auth.js:99 | ✅ Fully implemented |
| Logout | auth.js:137 | ✅ Fully implemented |
| Google OAuth | auth.js:184 | ✅ Start works, callback needs E2E (B1) |
| Password reset | auth.js:157 | ❌ STUB |
| OTP | auth.js:172 | ❌ STUB |
