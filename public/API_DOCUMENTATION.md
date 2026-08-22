# ANERIUM OnePass API Documentation

**Base URL:** `https://anerium.com`
**API Prefix:** `/api`
**Auth:** Bearer token (JWT) — `Authorization: Bearer <token>`
**Content-Type:** `application/json`

---

## Authentication Endpoints

### POST /api/apps/:appId/auth/login
Login with email + password.
- **Auth:** None required
- **Rate Limit:** 100 req/min per IP
- **Body:** `{ "email": "string", "password": "string" }`
- **Success (200):** `{ "access_token": "jwt_token", "user": { id, email, full_name, role, is_active, avatar_url, ... } }`
- **Errors:** 400 (missing fields), 401 (invalid credentials), 403 (account suspended)

### POST /api/apps/:appId/auth/register
Register a new user account.
- **Auth:** None required
- **Rate Limit:** 100 req/min per IP
- **Body:** `{ "email": "string", "password": "string", "full_name": "string (optional)", "first_name": "string (optional)", "last_name": "string (optional)" }`
- **Success (201):** `{ "access_token": "jwt_token", "user": { ... }, "is_new_user": true }`
- **Errors:** 400 (missing fields), 409 (email already registered)

### POST /api/apps/:appId/auth/logout
Revoke current session token.
- **Auth:** Bearer token (optional)
- **Success (200):** `{ "success": true, "message": "Logged out successfully" }`

### POST /api/apps/:appId/auth/reset-password-request
Request a password reset link.
- **Auth:** None
- **Rate Limit:** 100 req/min per IP
- **Body:** `{ "email": "string" }`
- **Success (200):** `{ "success": true, "message": "If the email exists, a reset link has been sent." }`

### POST /api/apps/:appId/auth/reset-password
Reset password with token.
- **Auth:** None
- **Rate Limit:** 100 req/min per IP
- **Body:** `{ "token": "string", "password": "string" }`
- **Success (200):** `{ "success": true }`

### POST /api/apps/:appId/auth/change-password
Change password for authenticated user.
- **Auth:** Bearer token
- **Body:** `{ "current_password": "string", "new_password": "string" }`
- **Success (200):** `{ "success": true }`

### POST /api/apps/:appId/auth/verify-otp
Verify OTP code.
- **Auth:** None
- **Rate Limit:** 100 req/min per IP
- **Body:** `{ "email": "string", "otp": "string" }`
- **Success (200):** `{ "success": true }`

### POST /api/apps/:appId/auth/resend-otp
Resend OTP code.
- **Auth:** None
- **Rate Limit:** 100 req/min per IP
- **Body:** `{ "email": "string" }`
- **Success (200):** `{ "success": true }`

### GET /api/apps/:appId/auth/google/start
Start Google OAuth flow — redirects to Google consent screen.
- **Auth:** None
- **Query Params:** `popup_origin` (optional) — for popup web flow
- **Response:** 302 redirect to `https://accounts.google.com/o/oauth2/v2/auth?...`

### GET /api/apps/:appId/auth/google/callback
Google OAuth callback — exchanges code for tokens, creates/finds user, redirects to app.
- **Auth:** None
- **Query Params:** `code` (from Google), `state` (from Google)
- **Response:** 302 redirect to `anerium://redirect?token=<jwt>&user=<json>` (mobile) or `/auth-callback.html?token=<jwt>` (web popup)

### GET /api/apps/auth/login
Social auth login redirect (Google) — used by website frontend.
- **Auth:** None
- **Query Params:** `from_url` (optional), `popup_origin` (optional)
- **Response:** 302 redirect to Google OAuth start

### GET /api/apps/auth/google/login
Google social auth from website.
- **Auth:** None
- **Response:** 302 redirect to `/api/apps/:appId/auth/google/start`

### GET /api/apps/auth/logout
Redirect-based logout from website.
- **Auth:** None
- **Query Params:** `from_url` (optional, default `/`)
- **Response:** 302 redirect to `from_url`

### GET /auth/google/start
Root-level Google OAuth start (matches Google Cloud Console redirect URI).
- **Auth:** None
- **Response:** 302 redirect to Google consent screen

### GET /auth/google/callback
Root-level Google OAuth callback.
- **Auth:** None
- **Query Params:** `code`, `state`
- **Response:** 302 redirect to `anerium://redirect?token=<jwt>&user=<json>`

---

## Public Endpoints

### GET /api/apps/public/prod/public-settings/by-id/:appId
Returns public app settings for frontend initialization.
- **Auth:** None
- **Success (200):** `{ "id": "string", "name": "ANERIUM One Pass", "status": "active", "is_public": true, "requires_auth": false, "settings": { app_name, primary_color, locale } }`

### GET /health
Health check endpoint.
- **Auth:** None
- **Rate Limit:** Exempt
- **Success (200):** `{ "status": "ok" }`

---

## Entity Endpoints (CRUD)

All entity endpoints require JWT authentication (`Authorization: Bearer <token>`).
General rate limit: 1000 req/min per user, 100 req/min per IP.

### GET /api/apps/:appId/entities/:entityName
List/filter entity records.
- **Auth:** Bearer token (required)
- **Query Params:**
  - `q` — JSON filter object (e.g., `{"status":"active"}`)
  - `sort` — Sort field with optional `-` prefix (e.g., `-created_date`)
  - `limit` — Max records (default: 100)
  - `skip` — Records to skip for pagination
  - `fields` — Comma-separated field list to project
- **Success (200):** Array of entity records

### GET /api/apps/:appId/entities/:entityName/:id
Get a single entity record by ID.
- **Auth:** Bearer token (required)
- **Success (200):** Entity record object
- **Errors:** 404 (not found)

### GET /api/apps/:appId/entities/User/me
Get the current authenticated user's profile.
- **Auth:** Bearer token (required)
- **Success (200):** User object (password_hash stripped)

### PUT /api/apps/:appId/entities/User/me
Update the current authenticated user's profile.
- **Auth:** Bearer token (required)
- **Body:** Fields to update (e.g., `{ "full_name": "New Name", "avatar_url": "https://..." }`)
- **Success (200):** Updated user object (password_hash stripped)

### POST /api/apps/:appId/entities/:entityName
Create a new entity record.
- **Auth:** Bearer token (required)
- **Body:** Entity data object (fields depend on entity type)
- **Success (201):** Created entity record
- **Note:** `id`, `created_date`, `updated_date`, `created_by` auto-generated if not provided

### POST /api/apps/:appId/entities/:entityName/bulk
Create multiple entity records.
- **Auth:** Bearer token (required)
- **Body:** Array of entity data objects
- **Success (201):** Array of created records

### PUT /api/apps/:appId/entities/:entityName/:id
Update an entity record by ID.
- **Auth:** Bearer token (required)
- **Body:** Fields to update
- **Success (200):** Updated entity record

### PATCH /api/apps/:appId/entities/:entityName/update-many
Update multiple records by query filter.
- **Auth:** Bearer token (required)
- **Body:** `{ "query": { ... }, "data": { ... } }`
- **Success (200):** Count of updated records

### DELETE /api/apps/:appId/entities/:entityName/:id
Delete a single entity record by ID.
- **Auth:** Bearer token (required)
- **Success (200):** `{ "success": true }`

### DELETE /api/apps/:appId/entities/:entityName
Delete records by query filter.
- **Auth:** Bearer token (required)
- **Query Params:** `q` — JSON filter object
- **Success (200):** Count of deleted records

---

## Function Endpoints (Custom Business Logic)

### POST /api/apps/:appId/functions
Execute a custom function action.
- **Auth:** Bearer token (required for most actions)
- **Body:** `{ "action": "string", ...params }`
- **Actions:**
  - `getProfile` — Get user profile with memberships, favorites, notifications, transactions, loyalty points
  - `searchBusinesses` — Search/filter businesses by category, query, location
  - `getBusinessDetails` — Get full business details with reviews, discounts, locations
  - `submitReview` — Submit a customer review for a business
  - `updateBusinessProfile` — Update business profile (business owner only)
  - `contactBusiness` — Send a contact message to a business
  - `registerBusiness` — Register a new business
  - `getLoyaltyPoints` — Get user's loyalty point balance
  - `redeemPoints` — Redeem loyalty points
  - `getDashboard` — Get business owner dashboard data
  - `getNotifications` — Get user notifications
  - `updateNotificationSettings` — Update notification preferences
  - `getMembershipPlans` — List available membership plans
  - `subscribeToPlan` — Subscribe user to a membership plan
  - `cancelSubscription` — Cancel a subscription
  - `getTransactions` — Get user transaction history
  - `getBlogPosts` — List blog posts
  - `getBlogPost` — Get a single blog post by slug
  - `getSupportTickets` — Get user support tickets
  - `createSupportTicket` — Create a new support ticket
- **Rate Limit:** 1000 req/min per user
- **Response:** Varies by action

---

## Monitoring Endpoints

### GET /api/monitoring/health
Full monitoring dashboard data — endpoints, DB stats, alerts, system metrics.
- **Auth:** None (internal — restrict via firewall/Caddy if exposed)
- **Success (200):** `{ overallStatus, uptime, thresholds, endpoints[], database{}, alerts[], system{} }`
- **Thresholds:**
  - `ENDPOINT_MS`: 500 — endpoint response time warning threshold
  - `DB_QUERY_MS`: 100 — database query warning threshold
  - `ERROR_RATE_PCT`: 1 — error rate critical threshold (requires ≥10 requests)
- **Alert Types:**
  - `ENDPOINT_SLOW` (warning) — response time > 500ms
  - `DB_SLOW_QUERY` (warning) — query time > 100ms
  - `HIGH_ERROR_RATE` (critical) — error rate > 1% (min 10 requests)
  - `DB_ERROR` (critical) — any database error

### GET /api/monitoring/alerts
Get active alerts only.
- **Auth:** None (internal)
- **Success (200):** `{ count, critical, warnings, alerts[] }`

### POST /api/monitoring/reset
Reset all metrics (useful for testing).
- **Auth:** None (internal)
- **Success (200):** `{ "success": true, "message": "Metrics reset" }`

---

## Entity Types

| Entity | Table | Description |
|--------|-------|-------------|
| User | users | App users with email/password or Google OAuth |
| Business | businesses | Registered businesses on the platform |
| BusinessCategory | business_categories | Category taxonomy for businesses |
| BusinessLocation | business_locations | Physical locations for businesses |
| Review | reviews | Customer reviews for businesses |
| Discount | discounts | Active discounts/offers |
| MembershipPlan | membership_plans | Available membership tiers |
| UserMembership | user_memberships | User membership subscriptions |
| Subscription | subscriptions | Business subscriptions |
| Transaction | transactions | Customer transaction records |
| LoyaltyPoint | loyalty_points | User loyalty point entries |
| LoyaltyTier | loyalty_tiers | Business loyalty tier definitions |
| Campaign | campaigns | Marketing campaigns |
| BlogPost | blog_posts | Blog/news articles |
| SupportTicket | support_tickets | Customer support tickets |
| ChatMessage | chat_messages | In-app chat messages |
| CRMRecord | crm_records | CRM contact records |
| Notification | notifications | User notification records |
| Permission | permissions | Role permissions |
| SystemSetting | system_settings | App configuration settings |
| Coupon | coupons | Discount coupon codes |
| Booking | bookings | Customer bookings/reservations |

---

## Security

- **CORS:** Locked to `anerium.com`, `www.anerium.com`, `anerium.de`, `www.anerium.de`, `localhost:3000`, `localhost:3001`
- **Rate Limiting:**
  - Auth endpoints: 100 req/min per IP
  - General API: 1000 req/min per user, 100 req/min per IP (unauthenticated)
- **Security Headers:** HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (via `helmet`)
- **Input Sanitization:** All request bodies stripped of `<script>` tags, HTML tags, and `javascript:` URIs
- **Password Storage:** bcrypt hashing — password_hash never returned in any API response
- **SQL Injection Protection:** All queries use parameterized `pool.query($1, $2, ...)` — zero raw query concatenation
- **JWT:** Tokens signed with `JWT_SECRET` env var, revocable via `revokeToken()`

---

## Error Responses

All errors return JSON:
```json
{ "error": "Error message" }
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request — missing/invalid parameters |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — account suspended or insufficient permissions |
| 404 | Not found |
| 409 | Conflict — duplicate resource |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
