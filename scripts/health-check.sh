#!/bin/bash
# ANERIUM OnePass — Comprehensive Health Check
# Runs every minute via cron

set -euo pipefail

HEALTH_URL="https://anerium.com/health"
LOG_FILE="/opt/anerium/logs/health-check.log"
ALERT_LOG="/opt/anerium/logs/alerts.log"
DISK_THRESHOLD=80
CERT_DAYS_THRESHOLD=30

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

alert() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ALERT: $1" >> "$ALERT_LOG"
  log "ALERT: $1"
  # Send alert via webhook if configured
  if [ -n "${DISCORD_WEBHOOK:-}" ]; then
    curl -s -X POST "$DISCORD_WEBHOOK" -H "Content-Type: application/json" -d "{\"content\":\"🚨 ANERIUM ALERT: $1\"}" 2>/dev/null
  fi
  if [ -n "${SLACK_WEBHOOK:-}" ]; then
    curl -s -X POST "$SLACK_WEBHOOK" -H "Content-Type: application/json" -d "{\"text\":\"🚨 ANERIUM ALERT: $1\"}" 2>/dev/null
  fi
}

# 1. HTTP Health Check
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" != "200" ]; then
  alert "Health check failed: HTTP $HTTP_CODE"
else
  log "Health: OK (200)"
fi

# 2. Disk Space Check
DISK_USAGE=$(df / | awk 'NR==2 {gsub(/%/,""); print $5}')
if [ "$DISK_USAGE" -ge "$DISK_THRESHOLD" ]; then
  alert "Disk usage at ${DISK_USAGE}% (threshold: ${DISK_THRESHOLD}%)"
else
  log "Disk: ${DISK_USAGE}% used (threshold: ${DISK_THRESHOLD}%)"
fi

# 3. Certificate Expiry Check
CERT_EXPIRY=$(echo | openssl s_client -connect anerium.com:443 -servername anerium.com 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$CERT_EXPIRY" ]; then
  CERT_EPOCH=$(date -d "$CERT_EXPIRY" +%s 2>/dev/null)
  NOW_EPOCH=$(date +%s)
  DAYS_LEFT=$(( (CERT_EPOCH - NOW_EPOCH) / 86400 ))
  if [ "$DAYS_LEFT" -le "$CERT_DAYS_THRESHOLD" ]; then
    alert "SSL certificate expires in ${DAYS_LEFT} days (threshold: ${CERT_DAYS_THRESHOLD} days)"
  else
    log "Cert: ${DAYS_LEFT} days remaining"
  fi
fi

# 4. Docker Container Check
APP_STATUS=$(docker ps --filter name=anerium-app-1 --format "{{.Status}}" 2>/dev/null | head -1)
DB_STATUS=$(docker ps --filter name=anerium-db-1 --format "{{.Status}}" 2>/dev/null | head -1)
if [[ ! "$APP_STATUS" =~ "Up" ]]; then
  alert "App container not running: $APP_STATUS"
fi
if [[ ! "$DB_STATUS" =~ "Up" ]]; then
  alert "DB container not running: $DB_STATUS"
fi
log "Docker: app=$APP_STATUS, db=$DB_STATUS"

# 5. Database Dead Tuples Check
DEAD_TUPLES=$(docker exec anerium-db-1 psql -U anerium -d anerium -t -c "SELECT sum(n_dead_tup) FROM pg_stat_user_tables;" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$DEAD_TUPLES" -gt 1000 ]; then
  alert "Dead tuples: ${DEAD_TUPLES} (threshold: 1000) — VACUUM recommended"
else
  log "DB dead tuples: ${DEAD_TUPLES}"
fi

# 6. WAL Archive Check
WAL_COUNT=$(ls /opt/anerium/wal_archive/ 2>/dev/null | wc -l)
log "WAL archives: ${WAL_COUNT} files"
