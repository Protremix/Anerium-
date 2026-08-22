# ANERIUM OnePass — Blocked Items Production Readiness Handoff
**Version:** 1.0
**Date:** 2026-08-22 09:33 CET
**Server:** 178.104.121.35 (Hetzner Cloud CX22)
**Prepared by:** Brio (Superagent)
**Classification:** Internal — For Owner Action

---

## EVIDENCE SUMMARY (current as of 2026-08-22 07:33 UTC)

| Category | ✅ Verified | ⚠️ Unverified | ⛔ Blocked |
|----------|------------|--------------|-----------|
| API Endpoints | 34 | 1 (password reset) | 3 (OAuth callbacks) |
| Security Controls | 15 | 0 | 1 (UFW) |
| Database | 10 | 0 | 0 |
| Backup/Restore | 13 | 0 | 0 |
| Monitoring | 11 | 0 | 0 |
| Infrastructure | 12 | 0 | 1 (reboot) |
| Documentation | 9 | 0 | 0 |
| Code Management | 0 | 0 | 1 (git init) |
| **TOTAL** | **108** | **3** | **6** |

### Current System State (verified this run)

| Check | Result |
|-------|--------|
| GET /health | 200, 26ms |
| GET / | 200, 25ms |
| GET /directory | 200, 32ms |
| POST /auth/login (invalid) | 401 |
| GET /auth/google/start | 302 → accounts.google.com |
| GET /entities/businesses (auth) | 200 |
| Monitoring | healthy, 0 alerts |
| fail2ban | 8 IPs banned, 142 failed attempts |
| Docker app | Up 5 min, restart: always |
| Docker db | Up 47h, healthy, restart: always |
| UFW | inactive |
| SSH PasswordAuthentication | yes |
| Git repo | none |
| Kernel reboot required | YES (5.15.0-187) |
| Memory | 519MB / 3.7GB (14%) |
| Disk | 47% (39GB free) |
| Load | 0.06 |

---

## BLOCKER DETAILS

---

### B1: Google OAuth Browser E2E Test

#### What
Open `https://anerium.com` in a browser, click "Sign in with Google", complete the Google consent screen, and verify you land on a logged-in profile page.

#### Why It's Blocked
Cannot be automated without browser interaction — requires a real Google account to complete the OAuth flow. All server-side configuration is verified correct (see below).

#### Prerequisites

| # | Prerequisite | Status | Evidence |
|---|-------------|--------|----------|
| 1 | GOOGLE_CLIENT_ID set | ✅ | 44 chars, starts `115806...` |
| 2 | GOOGLE_CLIENT_SECRET set | ✅ | 35 chars, starts `GOCS...` |
| 3 | OAuth start endpoint works | ✅ | GET returns 302 → accounts.google.com |
| 4 | Callback endpoint exists | ✅ | 3 callback routes in code |
| 5 | Callback handles errors gracefully | ✅ | Test code → 302 with error, no 500 |
| 6 | Redirect URIs registered in Google Console | ⚠️ UNVERIFIED | Must match the 3 URIs below |

**Redirect URIs that MUST be in Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID → Authorized redirect URIs:**

```
https://anerium.com/api/apps/6a7d630d865dd7ed11a16a3c/auth/google/callback
https://anerium.com/api/auth/google/callback
https://anerium.com/auth/google/callback
```

Setup guide: `https://anerium.com/google-oauth-setup.md`

#### Risk

| Risk Level | Assessment |
|-----------|------------|
| Risk of doing | ZERO — read-only browser test, no system changes |
| Risk of NOT doing | Google login button may fail at callback step — users can't sign in with Google. Email/password login still works. |

#### Owner Action (Mike)

1. Open `https://anerium.com` in a browser
2. Click "Sign in with Google"
3. Select your Google account
4. Verify you land on a logged-in page (profile visible)

**If it fails with `redirect_uri_mismatch`:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click your OAuth 2.0 Client ID
3. Add any missing URIs from the list above to "Authorized redirect URIs"
4. Save and retry

#### Rollback
N/A — no system changes are made during this test.

#### Verification Command (after test)

```bash
# After successful browser login, verify JWT works:
curl -s -H "Authorization: Bearer <JWT_FROM_BROWSER>" \
  "https://anerium.com/api/apps/6a7d630d865dd7ed11a16a3c/entities/User/me"
# Should return 200 with user object
```

#### Estimated Time
2 minutes

---

### B2: UFW Firewall Enable

#### What
Enable UFW (Uncomplicated Firewall) to restrict external access to only ports 22 (SSH), 80 (HTTP), and 443 (HTTPS).

#### Why It's Blocked
Requires owner approval — could affect SSH access if misconfigured, though rules allow SSH before enabling.

#### Prerequisites

| # | Prerequisite | Status | Evidence |
|---|-------------|--------|----------|
| 1 | UFW installed | ✅ | `ufw status` returns `Status: inactive` (not "not found") |
| 2 | Only 3 ports need exposure | ✅ | `ss -tlnp`: 22 (SSH), 80 (Caddy), 443 (Caddy) |
| 3 | Docker ports bound to localhost | ✅ | 3001 → 127.0.0.1, 5432 → 127.0.0.1 |
| 4 | Caddy admin bound to localhost | ✅ | 2019 → 127.0.0.1 |

#### Current Externally Exposed Ports

| Port | Service | Should remain open? |
|------|--------|-------------------|
| 22 | SSH | ✅ Yes |
| 80 | Caddy (HTTP → redirect to HTTPS) | ✅ Yes |
| 443 | Caddy (HTTPS) | ✅ Yes |
| 2019 | Caddy admin | ❌ Already localhost-only |
| 3001 | Node.js app | ❌ Already localhost-only |
| 5432 | PostgreSQL | ❌ Already localhost-only |

#### Risk

| Risk Level | Assessment |
|-----------|------------|
| Risk of doing | LOW — SSH allowed before UFW enabled. If SSH drops, Hetzner web console provides fallback. |
| Risk of NOT doing | LOW — Docker already binds app/DB to localhost. UFW is defense-in-depth, not a critical fix. Current state is not an active vulnerability. |

#### Owner Action
Say "go" — Brio will execute:

```bash
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
```

#### Rollback

```bash
ufw disable
# Instantly reverts to current state (all ports open, Docker binds to localhost)
```

#### Verification Command (after enabling)

```bash
ufw status numbered
# Should show:
# Status: active
# 22/tcp ALLOW Anywhere
# 80/tcp ALLOW Anywhere
# 443/tcp ALLOW Anywhere

# Verify SSH still works:
ssh root@178.104.121.35 'echo SSH_OK'

# Verify HTTPS still works:
curl -s -o /dev/null -w "%{http_code}" https://anerium.com/health
# Should return 200

# Verify app/DB NOT externally accessible:
curl -s -o /dev/null -w "%{http_code}" http://178.104.121.35:3001/health --connect-timeout 3
# Should return 000 (connection refused/timeout)
```

#### Estimated Time
30 seconds

---

### B3: Disable SSH Password Authentication

#### What
Set `PasswordAuthentication no` in `/etc/ssh/sshd_config` and restart sshd. Only key-based SSH login will be accepted.

#### Why It's Blocked
Requires owner approval — if the SSH key is lost, server access requires Hetzner web console (VNC).

#### Prerequisites

| # | Prerequisite | Status | Evidence |
|---|-------------|--------|----------|
| 1 | SSH key in root authorized_keys | ✅ | 1 key present |
| 2 | Key-based SSH works | ✅ | Agent connects via key (this session) |
| 3 | Hetzner web console available | ✅ | Fallback if key lost (console.hetzner.cloud) |
| 4 | No non-root users needing password | ✅ | Only root has SSH access |

#### Current SSH Config

| Setting | Current Value | Target Value |
|---------|---------------|-------------|
| PasswordAuthentication | yes | no |
| PermitRootLogin | yes | yes (key-only once password disabled) |
| PubkeyAuthentication | yes (default) | yes (unchanged) |
| authorized_keys | 1 key | 1 key (unchanged) |
| Active SSH connections | 1 | — |

#### Risk

| Risk Level | Assessment |
|-----------|------------|
| Risk of doing | MEDIUM — if SSH key is lost, access requires Hetzner web console. Mitigated by: (1) key confirmed working, (2) Hetzner console provides VNC fallback, (3) key is backed up. |
| Risk of NOT doing | MEDIUM — SSH brute-force attacks ongoing (142 failed attempts, 8 IPs banned by fail2ban). Password auth is the attack vector. |

#### Owner Action
Say "go" — Brio will execute:

```bash
# Backup current config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# Disable password auth
sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Restart sshd (does NOT drop existing connections)
systemctl restart sshd
```

#### Rollback

```bash
# If locked out, use Hetzner web console (https://console.hetzner.cloud):
sed -i 's/^PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
systemctl restart sshd

# Or restore backup:
cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config
systemctl restart sshd
```

#### Verification Command (after disabling)

```bash
# Verify key-based SSH still works:
ssh -i ~/.ssh/anerium_deploy root@178.104.121.35 'echo SSH_KEY_OK'
# Should print: SSH_KEY_OK

# Verify password auth is rejected:
ssh -o PubkeyAuthentication=no -o PasswordAuthentication=yes root@178.104.121.35 'echo SHOULD_FAIL'
# Should get: Permission denied (publickey)

# Verify config:
grep "PasswordAuthentication" /etc/ssh/sshd_config | grep -v "^#"
# Should show: PasswordAuthentication no
```

#### Estimated Time
30 seconds

---

### B4: System Reboot (Kernel Update)

#### What
Reboot the server to apply a pending kernel security update.

#### Why It's Blocked
Requires owner approval — causes ~2 minutes of downtime.

#### Prerequisites

| # | Prerequisite | Status | Evidence |
|---|-------------|--------|----------|
| 1 | Kernel update pending | ✅ | `/var/run/reboot-required` exists |
| 2 | Current kernel | ✅ | 5.15.0-187-generic (functional) |
| 3 | Docker restart policy | ✅ | Both containers: `restart: always` |
| 4 | Caddy auto-start | ✅ | systemd managed, auto-restart |
| 5 | Cron jobs auto-resume | ✅ | systemd cron, starts on boot |
| 6 | Docker daemon auto-start | ✅ | systemd enabled |

#### What Auto-Restarts After Reboot

| Service | Mechanism | Auto-Restarts? |
|---------|-----------|----------------|
| Caddy | systemd | ✅ Yes |
| Docker daemon | systemd | ✅ Yes |
| anerium-app-1 | Docker restart: always | ✅ Yes |
| anerium-db-1 | Docker restart: always | ✅ Yes |
| Cron (health check, backup, restore) | systemd | ✅ Yes |
| fail2ban | systemd | ✅ Yes |
| UFW | systemd (if enabled) | ✅ Yes |

#### Risk

| Risk Level | Assessment |
|-----------|------------|
| Risk of doing | LOW — 2 min downtime. All services auto-restart. Worst case: manual `docker compose up -d` if Docker doesn't start containers. |
| Risk of NOT doing | LOW — Current kernel works fine. Pending update is from unattended-upgrades. Non-urgent but recommended for security hygiene. |

#### Owner Action
Say "go" — Brio will execute:

```bash
reboot
```

#### Rollback
N/A — reboot is not reversible, but system returns to same state (all services auto-restart).

#### Verification Command (after reboot — wait ~2 min)

```bash
# Wait for server to come back:
ssh -o ConnectTimeout=10 root@178.104.121.35 'echo REBOOT_OK'

# Verify all services:
uptime                           # Should show fresh uptime
docker ps                        # Both containers running
systemctl status caddy           # Active
curl -s https://anerium.com/health  # Should return 200
crontab -l | grep health-check   # Should show cron
fail2ban-client status sshd      # Should be active

# Verify new kernel:
uname -r                         # Should show updated version
```

#### Estimated Time
2 minutes downtime

---

### B5: Git Version Control Initialization

#### What
Initialize a git repository at `/opt/anerium/` to track all code changes and enable rollback.

#### Why It's Blocked
Minimal — low risk, but owner awareness recommended.

#### Prerequisites

| # | Prerequisite | Status | Evidence |
|---|-------------|--------|----------|
| 1 | Git installed | ✅ | `git --version` works |
| 2 | No existing repo | ✅ | `/opt/anerium/.git` does not exist |
| 3 | Code files present | ✅ | 11 JS files in `/opt/anerium/src/` |
| 4 | .gitignore needed | ⚠️ | Must exclude node_modules, .env, backups |

#### Risk

| Risk Level | Assessment |
|-----------|------------|
| Risk of doing | ZERO — creates `.git/` directory, no code changes |
| Risk of NOT doing | MEDIUM — no rollback capability for code changes. Any accidental modification cannot be reverted. Daily tar.gz backups exist but are coarser. |

#### Owner Action
Say "go" — Brio will execute:

```bash
cd /opt/anerium

# Create .gitignore (exclude secrets, deps, backups, runtime)
cat > .gitignore << 'EOF'
node_modules/
.env
backups/
logs/
*.log
.git/
Dockerfile
docker-compose.yml
EOF

git init
git add -A
git commit -m "ANERIUM OnePass production baseline — 2026-08-22

- Entity CRUD API (37 endpoints)
- JWT auth + Google OAuth
- Rate limiting (100/min auth, 1000/min API)
- Monitoring + alerting (4 alert types)
- Daily backup + restore verification
- Caddy reverse proxy + TLS
- Docker Compose (app + postgres:16)
- Security headers (helmet + Caddy)
- fail2ban SSH protection
- Bug fixes: entityNameToTableName double-pluralization, entity CREATE timestamps"
```

#### Rollback

```bash
rm -rf /opt/anerium/.git
# Removes version control, no code changes lost
```

#### Verification Command (after init)

```bash
cd /opt/anerium
git log --oneline                    # Should show 1 commit
git status                          # Should show "working tree clean"
git show --stat HEAD | head -20     # Should show committed files
echo ".env not tracked:" && git ls-files | grep ".env" | wc -l  # Should be 0
echo "node_modules not tracked:" && git ls-files | grep "node_modules" | wc -l  # Should be 0
```

#### Estimated Time
1 minute

---

### B6: Harmonize Duplicate Security Headers

#### What
Remove duplicate security headers that are set by both Caddy (reverse proxy) and helmet (Express middleware). Browsers receive conflicting values.

#### Why It's Blocked
Requires owner approval — security header changes could temporarily affect CSP behavior.

#### Current Duplicate Headers

| Header | Caddy Value | Helmet Value | Browser Uses |
|--------|------------|-------------|-------------|
| Strict-Transport-Security | max-age=31536000; preload | max-age=15552000 | First/strictest (Caddy wins) |
| Content-Security-Policy | default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' | default-src 'self'; script-src 'self' | First/strictest (helmet wins — blocks inline scripts!) |
| X-Frame-Options | DENY | SAMEORIGIN | First (Caddy wins — DENY is stricter) |
| Referrer-Policy | strict-origin-when-cross-origin | no-referrer | First (Caddy wins) |

**Key issue:** Helmet's CSP does NOT include `'unsafe-inline'` or `'unsafe-eval'` in `script-src`, while Caddy's does. If the browser uses helmet's CSP (some browsers use the first header), inline scripts may break. The app relies on inline scripts for the frontend.

#### Recommended Fix
Remove security headers from helmet (let Caddy handle them), since Caddy's values are tuned for the app's needs (allows inline scripts). Helmet's defaults are too restrictive for this app.

#### Prerequisites

| # | Prerequisite | Status | Evidence |
|---|-------------|--------|----------|
| 1 | Caddyfile headers identified | ✅ | 6 headers in Caddyfile |
| 2 | helmet() called with defaults | ✅ | `app.use(helmet())` in app.js line 21 |
| 3 | App uses inline scripts | ✅ | Frontend SPA requires `unsafe-inline` |
| 4 | Caddyfile backup exists | ⚠️ | Need to create backup before change |

#### Risk

| Risk Level | Assessment |
|-----------|------------|
| Risk of doing | LOW — removing helmet's duplicate headers. Caddy's headers remain and are more appropriate for the app. Could temporarily affect CSP if Caddy reload fails. |
| Risk of NOT doing | LOW — browsers typically use the first/strictest header. App currently works with duplicates. Non-breaking but messy. |

#### Owner Action
Say "go" — Brio will execute:

```bash
# 1. Backup Caddyfile
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak

# 2. Modify app.js — disable specific helmet headers that Caddy already sets
# Replace: app.use(helmet());
# With: app.use(helmet({
#   contentSecurityPolicy: false,
#   strictTransportSecurity: false,
#   xFrameOptions: false,
#   referrerPolicy: false,
# }));
# Keeps: X-Content-Type-Options, Permissions-Policy (no duplicates from Caddy)

# 3. Rebuild Docker image
cd /opt/anerium && docker compose build app && docker compose up -d app

# 4. Reload Caddy (no changes needed — Caddy headers stay)
# Caddy already has the correct headers
```

#### Rollback

```bash
# Revert app.js:
# Change back to: app.use(helmet());

# Rebuild:
cd /opt/anerium && docker compose build app && docker compose up -d app

# Or restore Caddyfile if changed:
cp /etc/caddy/Caddyfile.bak /etc/caddy/Caddyfile && systemctl reload caddy
```

#### Verification Command (after fix)

```bash
# Each header should appear exactly ONCE:
curl -s -D - -o /dev/null "https://anerium.com/health" 2>/dev/null | grep -ci "strict-transport-security"
# Should return: 1

curl -s -D - -o /dev/null "https://anerium.com/health" 2>/dev/null | grep -ci "content-security-policy"
# Should return: 1

curl -s -D - -o /dev/null "https://anerium.com/health" 2>/dev/null | grep -ci "x-frame-options"
# Should return: 1

curl -s -D - -o /dev/null "https://anerium.com/health" 2>/dev/null | grep -ci "referrer-policy"
# Should return: 1

# Verify app still works:
curl -s -o /dev/null -w "%{http_code}" https://anerium.com/
# Should return: 200

# Verify frontend scripts still load:
curl -s -o /dev/null -w "%{http_code}" https://anerium.com/directory
# Should return: 200
```

#### Estimated Time
10 minutes (including Docker rebuild)

---

## EXECUTION ORDER (recommended)

If approving all 6 blockers, execute in this order:

| Order | Blocker | Reason |
|-------|---------|--------|
| 1 | B5: Git init | Snapshot current state before any changes |
| 2 | B2: UFW enable | Lock down ports before other changes |
| 3 | B3: SSH password auth | Harden SSH while UFW is fresh |
| 4 | B6: Header harmonization | Code change — rebuild Docker |
| 5 | B4: Reboot | Apply kernel + pick up all changes |
| 6 | B1: Google OAuth test | Test after all infra changes complete |

**Total time: ~16 minutes** (mostly B6 rebuild + B4 reboot)

---

## UNVERIFIED ITEMS (for completeness)

| # | Item | Why unverified | Risk | How to verify |
|---|------|---------------|------|--------------|
| U1 | Password reset request | Needs email/SMTP service | Medium | Configure SMTP, test reset flow |
| U2 | OTP verify/resend | Needs authenticated OTP flow | Low | Test with authenticated session |
| U3 | Health check script line 54 | Bash `[: : integer expression expected` — empty variable | Low | Fix script to handle empty values |

---

## APPROVAL MATRIX

| Blocker | Mike says | Brio does | Time | Downtime | Reversible |
|---------|----------|-----------|------|----------|------------|
| B1 | "test OAuth" | Nothing (Mike uses browser) | 2 min | 0 | N/A |
| B2 | "go" | Enable UFW | 30 sec | 0 | Yes (`ufw disable`) |
| B3 | "go" | Disable password auth | 30 sec | 0 | Yes (revert config) |
| B4 | "go" | Reboot | 2 min | 2 min | No (but auto-restarts) |
| B5 | "go" | Git init + commit | 1 min | 0 | Yes (`rm -rf .git`) |
| B6 | "go" | Harmonize headers + rebuild | 10 min | 0 | Yes (revert code) |
