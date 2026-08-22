# ANERIUM OnePass — Google OAuth Credential Setup Guide

## Overview

Google OAuth 2.0 enables "Sign in with Google" for ANERIUM users. This document specifies the exact credentials, redirect URIs, scopes, and safe setup steps required. **No secrets are included in this document** — all values must be created by the project owner in Google Cloud Console.

## Prerequisites

- Google account with access to [Google Cloud Console](https://console.cloud.google.com)
- ANERIUM server running at `https://anerium.com` with TLS active
- SSH access to the server to update `.env`

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown → **New Project**
3. Name: `ANERIUM OnePass`
4. Click **Create**
5. Select the new project from the dropdown

## Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services → OAuth consent screen**
2. Choose **External** (unless using Google Workspace)
3. Fill in:
   - **App name:** ANERIUM One Pass
   - **User support email:** your email
   - **App logo:** (optional, upload if available)
   - **App domain:** `anerium.com`
   - **Authorized domains:** `anerium.com`
   - **Developer contact information:** your email
4. Click **Save and Continue**
5. **Scopes page:** Add these scopes:
   - `openid` — OpenID Connect authentication
   - `.../auth/userinfo.email` — View user email
   - `.../auth/userinfo.profile` — View user profile info
   - These map to the scope string `openid email profile` used in the code
6. Click **Save and Continue**
7. **Test users:** Add your email for testing
8. Click **Save and Continue**

## Step 3: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services → Credentials**
2. Click **+ CREATE CREDENTIALS → OAuth client ID**
3. Application type: **Web application**
4. Name: `ANERIUM OnePass Web Client`
5. **Authorized JavaScript origins:**
   ```
   https://anerium.com
   https://www.anerium.com
   https://anerium.de
   https://www.anerium.de
   ```
6. **Authorized redirect URIs** (add ALL of these — the code references both paths):
   ```
   https://anerium.com/api/apps/6a7d630d865dd7ed11a16a3c/auth/google/callback
   https://anerium.com/api/auth/google/callback
   https://anerium.com/auth/google/callback
   ```
   - The first URI is used by the app-specific OAuth flow (`/api/apps/:appId/auth/google/start`)
   - The second URI is used by the root-level OAuth flow (`/auth/google/start`)
   - The third is a convenience alias
7. Click **Create**
8. **Copy the Client ID and Client Secret** — these are shown once

## Step 4: Configure Server Environment

SSH into the server and update `.env`:

```bash
ssh root@178.104.121.35
nano /opt/anerium/.env
```

Set these two variables (do NOT share or commit these values):
```
GOOGLE_CLIENT_ID=<paste-your-client-id-here>
GOOGLE_CLIENT_SECRET=<paste-your-client-secret-here>
```

Save and restart the app:
```bash
cd /opt/anerium
docker compose restart app
```

## Step 5: Verify

Test that the OAuth flow starts correctly:
```bash
# Should return a 302 redirect to accounts.google.com
curl -s -o /dev/null -w "HTTP %{http_code}\n" "https://anerium.com/api/apps/6a7d630d865dd7ed11a16a3c/auth/google/start"
# Expected: HTTP 302

# Check redirect target
curl -s -D - -o /dev/null "https://anerium.com/api/apps/6a7d630d865dd7ed11a16a3c/auth/google/start" | grep "location:"
# Expected: location: https://accounts.google.com/o/oauth2/v2/auth?client_id=...
```

If you get HTTP 500 with "Google OAuth is not configured", the `.env` values are missing or still set to the placeholder.

## Step 6: Push to Production (Verification Status)

1. In Google Cloud Console → OAuth consent screen
2. Click **PUSH TO PRODUCTION**
3. The app moves from "Testing" to "In production"
4. Users can now sign in without being added to the test users list

---

## Security Notes

- **Never commit `.env` to git** — it contains the client secret
- **Never share the Client Secret** in chat, screenshots, or logs
- **Rotate credentials** if the secret is exposed: delete the OAuth client in Google Cloud Console and create a new one
- **Restrict API key** (if created separately) to `anerium.com` domains only
- The consent screen should show the privacy policy URL once available
- For production apps with >100 users, Google requires verification (privacy policy URL, terms of service URL)

## Redirect URI Reference

| Route in Code | Redirect URI | Used By |
|---------------|-------------|---------|
| `GET /api/apps/:appId/auth/google/start` | `https://anerium.com/api/apps/6a7d630d865dd7ed11a16a3c/auth/google/callback` | App SDK frontend |
| `GET /auth/google/start` | `https://anerium.com/api/auth/google/callback` | Root-level OAuth flow |

## Scope Reference

| Scope | What it grants | Why needed |
|-------|---------------|------------|
| `openid` | OpenID Connect authentication | Verify Google identity |
| `email` | User's email address | Create/find user account by email |
| `profile` | User's name and profile picture | Populate full_name and avatar_url |

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| HTTP 500 "Google OAuth is not configured" | `.env` missing or placeholder values | Set real `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` |
| `redirect_uri_mismatch` | Redirect URI not registered in Google Console | Add the exact URIs listed above |
| `invalid_client` | Wrong Client ID or Secret | Verify `.env` values match Google Console |
| `access_denied` | User not in test users (in Testing mode) | Add user to test users, or push to production |
| `mismatching_redirect_uri` | Extra trailing slash or http:// | Use exact HTTPS URLs without trailing slashes |
