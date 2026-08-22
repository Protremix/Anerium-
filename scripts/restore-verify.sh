#!/bin/bash
# ANERIUM OnePass — Backup Restore + Verification Script
# Restores a DB backup to a temporary test database and verifies integrity
# Does NOT touch the production database — safe to run anytime

set -euo pipefail

BACKUP_DIR="/opt/anerium/backups"
DB_CONTAINER="anerium-db-1"
DB_USER="anerium"
DB_NAME="anerium"
TEST_DB="anerium_restore_test"
LOG_FILE="/opt/anerium/logs/restore-test.log"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Find the latest backup
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/db_*.sql.gz 2>/dev/null | head -1)
if [ -z "$LATEST_BACKUP" ]; then
  log "ERROR: No DB backup found in $BACKUP_DIR"
  exit 1
fi

log "=== Restore Verification Started ==="
log "Testing backup: $LATEST_BACKUP"

# 1. Integrity check
log "Step 1: Gzip integrity check..."
if ! gzip -t "$LATEST_BACKUP" 2>/dev/null; then
  log "FAIL: Gzip integrity check failed — backup is corrupted"
  exit 1
fi
log "PASS: Gzip integrity OK"

# 2. Decompress to temp file
log "Step 2: Decompressing backup..."
TEMP_SQL="/tmp/restore_test_${BASHPID}.sql"
gunzip -c "$LATEST_BACKUP" > "$TEMP_SQL"
SQL_SIZE=$(du -h "$TEMP_SQL" | cut -f1)
log "Decompressed: ${SQL_SIZE}"

# 3. Create temporary test database
log "Step 3: Creating test database '$TEST_DB'..."
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "DROP DATABASE IF EXISTS $TEST_DB;" 2>/dev/null
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "CREATE DATABASE $TEST_DB;" 2>/dev/null
log "Test database created"

# 4. Restore into test database
log "Step 4: Restoring backup into test database..."
cat "$TEMP_SQL" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$TEST_DB" 2>/dev/null
log "Restore completed"

# 5. Verify table count
log "Step 5: Verifying restored data..."
TABLE_COUNT=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$TEST_DB" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
log "Restored table count: $TABLE_COUNT"

# 6. Verify row counts match production
PROD_TABLES=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
log "Production table count: $PROD_TABLES"

if [ "$TABLE_COUNT" != "$PROD_TABLES" ]; then
  log "FAIL: Table count mismatch (restored: $TABLE_COUNT, production: $PROD_TABLES)"
else
  log "PASS: Table count matches production ($TABLE_COUNT tables)"
fi

# 7. Verify key table row counts
log "Step 6: Comparing row counts on key tables..."
for table in users businesses reviews transactions discounts loyalty_points blog_posts campaigns; do
  PROD_COUNT=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM $table;" 2>/dev/null || echo "0")
  RESTORE_COUNT=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$TEST_DB" -t -c "SELECT count(*) FROM $table;" 2>/dev/null || echo "0")
  PROD_COUNT=$(echo "$PROD_COUNT" | xargs)
  RESTORE_COUNT=$(echo "$RESTORE_COUNT" | xargs)
  if [ "$PROD_COUNT" = "$RESTORE_COUNT" ]; then
    log "  PASS: $table — $RESTORE_COUNT rows (matches production)"
  else
    log "  FAIL: $table — restored=$RESTORE_COUNT, production=$PROD_COUNT"
  fi
done

# 8. Verify indexes restored
INDEX_COUNT=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$TEST_DB" -t -c "SELECT count(*) FROM pg_indexes WHERE schemaname='public';")
INDEX_COUNT=$(echo "$INDEX_COUNT" | xargs)
log "Restored index count: $INDEX_COUNT"

# 9. Cleanup
log "Step 7: Cleaning up..."
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "DROP DATABASE $TEST_DB;" 2>/dev/null
rm -f "$TEMP_SQL"
log "Test database dropped, temp files removed"

log "=== Restore Verification Complete ==="
