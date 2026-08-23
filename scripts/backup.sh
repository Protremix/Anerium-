#!/bin/bash
# ANERIUM OnePass — Automated Backup Script with Offsite Push
# Runs daily via cron, creates compressed DB dump + code backup
# Pushes to S3-compatible storage (Hetzner Storage Box) if configured
# Retains 30 days local, 90 days offsite

set -euo pipefail

BACKUP_DIR="/opt/anerium/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="anerium-db-1"
DB_USER="anerium"
DB_NAME="anerium"
APP_DIR="/opt/anerium"
LOG_FILE="/opt/anerium/logs/backup.log"

# Offsite S3 config (Hetzner Storage Box or AWS S3)
# Set these in /opt/anerium/.env or as environment variables
S3_ENDPOINT="${S3_ENDPOINT:-}"
S3_BUCKET="${S3_BUCKET:-}"
S3_ACCESS_KEY="${S3_ACCESS_KEY:-}"
S3_SECRET_KEY="${S3_SECRET_KEY:-}"

mkdir -p "$BACKUP_DIR" "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

push_offsite() {
  local file="$1"
  local remote_path="$2"

  if [ -z "$S3_ENDPOINT" ] || [ -z "$S3_BUCKET" ]; then
    log "Offsite push: SKIPPED (no S3 config)"
    return 0
  fi

  log "Offsite push: $file -> s3://$S3_BUCKET/$remote_path"
  # S3 PUT via curl (S3-compatible API)
  local content_type="application/octet-stream"
  local date=$(date -u +"%a, %d %b %Y %H:%M:%S GMT")
  local resource="/${S3_BUCKET}/${remote_path}"
  local string_to_sign="PUT\n\n${content_type}\n${date}\n${resource}"
  local signature=$(echo -ne "$string_to_sign" | openssl dgst -sha1 -hmac "$S3_SECRET_KEY" -binary | base64)

  curl -s -X PUT \
    -H "Content-Type: $content_type" \
    -H "Date: $date" \
    -H "Authorization: AWS ${S3_ACCESS_KEY}:${signature}" \
    --data-binary @"$file" \
    "${S3_ENDPOINT}${resource}" 2>/dev/null

  if [ $? -eq 0 ]; then
    log "Offsite push: SUCCESS"
  else
    log "Offsite push: FAILED"
  fi
}

log "=== Backup started: $TIMESTAMP ==="

# 1. Database backup (compressed)
DB_BACKUP="$BACKUP_DIR/db_${TIMESTAMP}.sql.gz"
log "Creating DB backup: $DB_BACKUP"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" --no-owner --no-acl 2>/dev/null | gzip > "$DB_BACKUP"

if [ ! -s "$DB_BACKUP" ]; then
  log "ERROR: DB backup is empty — aborting"
  rm -f "$DB_BACKUP"
  exit 1
fi

DB_SIZE=$(du -h "$DB_BACKUP" | cut -f1)
log "DB backup complete: ${DB_SIZE}"

# 2. Verify backup integrity
if ! gzip -t "$DB_BACKUP" 2>/dev/null; then
  log "ERROR: DB backup gzip integrity check failed"
  exit 1
fi
log "DB backup integrity verified"

# 3. Code + config backup
CODE_BACKUP="$BACKUP_DIR/code_${TIMESTAMP}.tar.gz"
log "Creating code backup: $CODE_BACKUP"
tar czf "$CODE_BACKUP" \
  --exclude="node_modules" \
  --exclude=".git" \
  --exclude="public" \
  --exclude="backups" \
  --exclude="logs" \
  --exclude="wal_archive" \
  -C /opt anerium/src anerium/.env anerium/docker-compose.yml anerium/Dockerfile anerium/package.json 2>/dev/null

if [ ! -s "$CODE_BACKUP" ]; then
  log "WARNING: Code backup is empty"
else
  CODE_SIZE=$(du -h "$CODE_BACKUP" | cut -f1)
  log "Code backup complete: ${CODE_SIZE}"
fi

# 4. Push to offsite storage
push_offsite "$DB_BACKUP" "db_${TIMESTAMP}.sql.gz"
push_offsite "$CODE_BACKUP" "code_${TIMESTAMP}.tar.gz"

# 5. Prune old local backups
PRUNE_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d)
log "Pruning backups older than $RETENTION_DAYS days"
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -name "code_*.tar.gz" -mtime +"$RETENTION_DAYS" -delete

# 6. Summary
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/db_*.sql.gz 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Backup complete. Total: $BACKUP_COUNT backups, $TOTAL_SIZE"
log "=== Backup finished ==="
