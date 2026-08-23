# ANERIUM OnePass — Failover & Recovery Plan

## Server: Hetzner VPS (178.104.121.35, Nuremberg, EU)

## Scenario 1: App container crash
- Detection: health-check (60s), alert if down
- Auto-recovery: Docker restart=always
- Manual: `cd /opt/anerium && docker compose restart app`
- RTO: <30s

## Scenario 2: DB container crash
- Detection: health-check (60s)
- Auto-recovery: Docker restart=always + healthcheck
- Manual: `cd /opt/anerium && docker compose restart db`
- RTO: <60s

## Scenario 3: Server reboot
- Auto-recovery: Docker daemon starts containers (restart=always), Caddy via systemd, cron resumes
- RTO: 2-5 min

## Scenario 4: Complete server failure
1. Provision new Hetzner VPS (4GB RAM, 75GB disk)
2. Install Docker + Caddy
3. Restore Caddyfile from backup
4. Restore app code from code backup
5. Restore DB: `zcat db_XXXX.sql.gz | docker exec -i anerium-db-1 psql -U anerium -d anerium`
6. Replay WAL for PITR if needed
7. Update DNS A record to new IP
8. Caddy auto-provisions Let's Encrypt cert
- RTO: 1-3 hours
- RPO: <5 min (WAL archiving)

## Scenario 5: SSL cert failure
- Auto: Caddy auto-renews (90-day cycle)
- Monitor: cert alert at 30 days before expiry
- Manual: `caddy reload --config /etc/caddy/Caddyfile`

## Scenario 6: DB corruption
1. `docker compose stop app`
2. Restore from latest backup
3. Replay WAL archives for PITR
4. `docker compose start app`
- RTO: 15-30 min

## Backup locations
- Local: /opt/anerium/backups/ (30-day retention, daily at 3am UTC)
- WAL: /opt/anerium/wal_archive/ (PITR, 5-min granularity)
- Offsite: S3-compatible (configure with Hetzner Storage Box credentials)

## Monitoring
- Health check: every 60s (cron)
- Alerts: cert expiry (30d), disk (>80%), container down, dead tuples (>1000)
- Alert delivery: Discord/Slack webhook (alert-config.sh)

## Key contacts
- Server admin: Mike (via Base44 chat)
- Domain registrar: IONOS (anerium.com, anerium.de)
- Server provider: Hetzner
