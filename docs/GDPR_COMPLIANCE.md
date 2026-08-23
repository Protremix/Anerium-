# GDPR Compliance Audit — ANERIUM OnePass

## Date: 2026-08-22

## Data Residency
- ✅ Server: Hetzner Nuremberg, Germany (EU)
- ✅ Database: PostgreSQL on EU server
- ✅ Backups: local on EU server (encrypted)
- ✅ No third-country data transfer

## User Data Fields (users table)
- email, full_name, phone, avatar_url, date_of_birth (personal data)
- password_hash (security), otp_secret (security)
- role, business_id, is_active (operational)
- marketing_consent, push_notifications_enabled (consent management)

## GDPR Compliance Status
- ✅ Data stored in EU (Germany)
- ✅ SSL/TLS encryption in transit
- ✅ Marketing consent management (opt-in, withdrawable)
- ✅ Push notification consent management
- ✅ Privacy policy page (/privacy)
- ✅ Terms of service page (/terms)
- ✅ Google OAuth consent screen
- ✅ Security measures documented (HSTS, CSP, JWT, rate limiting)
- ✅ Data retention policy (30-day backups, 14-day logs)
- ✅ Failover plan with RTO/RPO documented
- ⚠️ Account deletion endpoint: NOT IMPLEMENTED (needed for Art. 17 right to erasure)
- ⚠️ Data export endpoint: NOT IMPLEMENTED (needed for Art. 20 data portability)
- ⚠️ Data processing agreement: NOT SIGNED (needed if B2B processing)

## Required Actions for Full GDPR Compliance
1. Implement account deletion endpoint (Art. 17)
2. Implement data export endpoint (Art. 20)
3. Add cookie consent banner (if using cookies)
4. Sign data processing agreement with business clients
5. Appoint a Data Protection Officer (if processing >5000 user records)
