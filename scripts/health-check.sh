#!/bin/bash
# ANERIUM automated health check — runs every minute via cron
# Checks: server health, DB connectivity, endpoint response times, alerts, docker, disk, memory

LOG_FILE="/var/log/anerium-health.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
HEALTH_URL="https://anerium.com/health"
MONITOR_URL="https://anerium.com/api/monitoring/health"
ALERT_URL="https://anerium.com/api/monitoring/alerts"

echo "[${TIMESTAMP}] Starting health check..." >> $LOG_FILE

# 1. Server health check
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" $HEALTH_URL 2>/dev/null)
HEALTH_CODE=$(echo $HEALTH_RESPONSE | cut -d'|' -f1)
HEALTH_TIME=$(echo $HEALTH_RESPONSE | cut -d'|' -f2)

if [ "$HEALTH_CODE" != "200" ]; then
    echo "[${TIMESTAMP}] CRITICAL: Health endpoint returned HTTP $HEALTH_CODE" >> $LOG_FILE
else
    echo "[${TIMESTAMP}] Server health: OK (HTTP $HEALTH_CODE, ${HEALTH_TIME}s)" >> $LOG_FILE
fi

# 2. Monitoring data check
MONITOR_DATA=$(curl -s $MONITOR_URL 2>/dev/null)
OVERALL_STATUS=$(echo $MONITOR_DATA | python3 -c "import sys,json; print(json.load(sys.stdin).get('overallStatus','unknown'))" 2>/dev/null)
UPTIME=$(echo $MONITOR_DATA | python3 -c "import sys,json; print(json.load(sys.stdin).get('uptime','unknown'))" 2>/dev/null)
TOTAL_REQUESTS=$(echo $MONITOR_DATA | python3 -c "import sys,json; d=json.load(sys.stdin); print(sum(e['requests'] for e in d.get('endpoints',[])))" 2>/dev/null)
TOTAL_ERRORS=$(echo $MONITOR_DATA | python3 -c "import sys,json; d=json.load(sys.stdin); print(sum(e['errors'] for e in d.get('endpoints',[])))" 2>/dev/null)
SLOW_ENDPOINTS=$(echo $MONITOR_DATA | python3 -c "import sys,json; d=json.load(sys.stdin); print(len([e for e in d.get('endpoints',[]) if e['avgMs'] > 500]))" 2>/dev/null)
SLOW_QUERIES=$(echo $MONITOR_DATA | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('database',{}).get('slowQueries',0))" 2>/dev/null)
DB_CONNECTIONS=$(echo $MONITOR_DATA | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('database',{}).get('activeConnections',0))" 2>/dev/null)

echo "[${TIMESTAMP}] Overall: $OVERALL_STATUS | Uptime: $UPTIME" >> $LOG_FILE
echo "[${TIMESTAMP}] Requests: $TOTAL_REQUESTS | Errors: $TOTAL_ERRORS | Slow endpoints: $SLOW_ENDPOINTS" >> $LOG_FILE
echo "[${TIMESTAMP}] DB: $SLOW_QUERIES slow queries | $DB_CONNECTIONS active connections" >> $LOG_FILE

# 3. Alert threshold checks
ALERTS_DATA=$(curl -s $ALERT_URL 2>/dev/null)
CRITICAL_COUNT=$(echo $ALERTS_DATA | python3 -c "import sys,json; print(json.load(sys.stdin).get('critical',0))" 2>/dev/null)
WARNING_COUNT=$(echo $ALERTS_DATA | python3 -c "import sys,json; print(json.load(sys.stdin).get('warnings',0))" 2>/dev/null)

# Default to 0 if empty (prevents "integer expression expected" bash error)
CRITICAL_COUNT=${CRITICAL_COUNT:-0}
WARNING_COUNT=${WARNING_COUNT:-0}

if [ "$CRITICAL_COUNT" -gt 0 ]; then
    echo "[${TIMESTAMP}] CRITICAL: $CRITICAL_COUNT critical alerts active!" >> $LOG_FILE
    curl -s $ALERT_URL | python3 -c "
import sys,json
d=json.load(sys.stdin)
for a in d.get('alerts',[])[:5]:
    if a.get('severity')=='critical':
        print('  CRITICAL: ' + a['type'] + ' - ' + a['message'])
" >> $LOG_FILE 2>/dev/null
fi

if [ "$WARNING_COUNT" -gt 0 ]; then
    echo "[${TIMESTAMP}] WARNING: $WARNING_COUNT warning alerts active" >> $LOG_FILE
fi

# 4. Docker containers
APP_STATUS=$(docker inspect --format='{{.State.Status}}' anerium-app-1 2>/dev/null)
DB_STATUS=$(docker inspect --format='{{.State.Status}}' anerium-db-1 2>/dev/null)
echo "[${TIMESTAMP}] Docker: app=$APP_STATUS db=$DB_STATUS" >> $LOG_FILE

if [ "$APP_STATUS" != "running" ]; then
    echo "[${TIMESTAMP}] CRITICAL: anerium-app-1 not running (status: $APP_STATUS)" >> $LOG_FILE
fi
if [ "$DB_STATUS" != "running" ]; then
    echo "[${TIMESTAMP}] CRITICAL: anerium-db-1 not running (status: $DB_STATUS)" >> $LOG_FILE
fi

# 5. Disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "[${TIMESTAMP}] WARNING: Disk usage at ${DISK_USAGE}%" >> $LOG_FILE
fi

# 6. Memory
MEM_USAGE=$(free | awk '/Mem:/ {printf "%.0f", $3/$2*100}')
if [ "$MEM_USAGE" -gt 80 ]; then
    echo "[${TIMESTAMP}] WARNING: Memory usage at ${MEM_USAGE}%" >> $LOG_FILE
fi

echo "[${TIMESTAMP}] Health check complete. Status: $OVERALL_STATUS" >> $LOG_FILE
echo "---" >> $LOG_FILE
