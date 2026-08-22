import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// In-memory metrics store (resets on restart, sufficient for real-time monitoring)
const metrics = {
  endpoints: {}, // { path: { count, errors, totalMs, lastCheck } }
  dbQueries: { count: 0, slowQueries: 0, totalMs: 0, slowestMs: 0, slowestQuery: '' },
  startTime: Date.now(),
  alerts: [],
};

// Thresholds
const THRESHOLDS = {
  ENDPOINT_MS: 500,
  DB_QUERY_MS: 100,
  ERROR_RATE_PCT: 1, // 1%
};

// Wrap pool.query to track DB performance
const originalQuery = pool.query.bind(pool);
pool.query = function(...args) {
  const start = Date.now();
  const queryText = typeof args[0] === 'string' ? args[0] : args[0]?.text || 'unknown';
  
  return originalQuery(...args).then(result => {
    const elapsed = Date.now() - start;
    metrics.dbQueries.count++;
    metrics.dbQueries.totalMs += elapsed;
    
    if (elapsed > metrics.dbQueries.slowestMs) {
      metrics.dbQueries.slowestMs = elapsed;
      metrics.dbQueries.slowestQuery = queryText.substring(0, 200);
    }
    
    if (elapsed > THRESHOLDS.DB_QUERY_MS) {
      metrics.dbQueries.slowQueries++;
      metrics.alerts.unshift({
        type: 'DB_SLOW_QUERY',
        message: `DB query took ${elapsed}ms (threshold: ${THRESHOLDS.DB_QUERY_MS}ms)`,
        query: queryText.substring(0, 150),
        timestamp: new Date().toISOString(),
        severity: 'warning',
      });
      // Keep only last 50 alerts
      if (metrics.alerts.length > 50) metrics.alerts = metrics.alerts.slice(0, 50);
    }
    
    return result;
  }).catch(err => {
    const elapsed = Date.now() - start;
    metrics.dbQueries.count++;
    metrics.dbQueries.totalMs += elapsed;
    metrics.alerts.unshift({
      type: 'DB_ERROR',
      message: `DB query failed: ${err.message}`,
      query: queryText.substring(0, 150),
      timestamp: new Date().toISOString(),
      severity: 'critical',
    });
    if (metrics.alerts.length > 50) metrics.alerts = metrics.alerts.slice(0, 50);
    throw err;
  });
};

// Metrics recording middleware — track all /api requests
export function metricsMiddleware(req, res, next) {
  // Skip monitoring endpoint itself and health check
  if (req.path.startsWith('/api/monitoring') || req.path === '/health') return next();
  
  const start = Date.now();
  const path = req.method + ' ' + (req.route?.path || req.path);
  
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    const key = path;
    
    if (!metrics.endpoints[key]) {
      metrics.endpoints[key] = { count: 0, errors: 0, totalMs: 0, lastStatus: 0, lastMs: 0 };
    }
    
    const m = metrics.endpoints[key];
    m.count++;
    m.totalMs += elapsed;
    m.lastStatus = res.statusCode;
    m.lastMs = elapsed;
    
    if (res.statusCode >= 400) {
      m.errors++;
    }
    
    // Alert: endpoint too slow
    if (elapsed > THRESHOLDS.ENDPOINT_MS) {
      metrics.alerts.unshift({
        type: 'ENDPOINT_SLOW',
        message: `${path} took ${elapsed}ms (threshold: ${THRESHOLDS.ENDPOINT_MS}ms)`,
        timestamp: new Date().toISOString(),
        severity: 'warning',
      });
      if (metrics.alerts.length > 50) metrics.alerts = metrics.alerts.slice(0, 50);
    }
    
    // Alert: error rate > 1%
    const errorRate = (m.errors / m.count) * 100;
    if (m.count >= 10 && errorRate > THRESHOLDS.ERROR_RATE_PCT) {
      metrics.alerts.unshift({
        type: 'HIGH_ERROR_RATE',
        message: `${path} error rate ${errorRate.toFixed(1)}% (threshold: ${THRESHOLDS.ERROR_RATE_PCT}%) — ${m.errors}/${m.count} requests`,
        timestamp: new Date().toISOString(),
        severity: 'critical',
      });
      if (metrics.alerts.length > 50) metrics.alerts = metrics.alerts.slice(0, 50);
    }
  });
  
  next();
}

// ============ Monitoring Endpoints ============

// GET /api/monitoring/health — full dashboard data
router.get('/monitoring/health', async (req, res) => {
  try {
    const uptime = Date.now() - metrics.startTime;
    const uptimeStr = `${Math.floor(uptime / 3600000)}h ${Math.floor((uptime % 3600000) / 60000)}m`;
    
    // Endpoint stats with avg response times and error rates
    const endpointStats = Object.entries(metrics.endpoints).map(([path, m]) => ({
      endpoint: path,
      requests: m.count,
      avgMs: Math.round(m.totalMs / m.count),
      lastMs: m.lastMs,
      errors: m.errors,
      errorRate: m.count > 0 ? parseFloat(((m.errors / m.count) * 100).toFixed(2)) : 0,
      lastStatus: m.lastStatus,
      status: m.lastStatus < 400 ? 'healthy' : m.lastStatus < 500 ? 'warning' : 'critical',
    }));
    
    // DB stats
    const dbStats = {
      totalQueries: metrics.dbQueries.count,
      avgQueryMs: metrics.dbQueries.count > 0 ? Math.round(metrics.dbQueries.totalMs / metrics.dbQueries.count) : 0,
      slowQueries: metrics.dbQueries.slowQueries,
      slowestQueryMs: metrics.dbQueries.slowestMs,
      slowestQuery: metrics.dbQueries.slowestQuery,
    };
    
    // Active alerts (last 24h, dedupe by type+message)
    const now = Date.now();
    const activeAlerts = metrics.alerts.filter(a => {
      const age = now - new Date(a.timestamp).getTime();
      return age < 24 * 60 * 60 * 1000; // 24h
    });
    
    // System stats
    const memUsage = process.memoryUsage();
    const systemStats = {
      uptime: uptimeStr,
      memoryMb: Math.round(memUsage.heapUsed / 1024 / 1024),
      memoryTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
      cpuLoad: process.cpuUsage(),
    };
    
    // DB connection stats
    const dbConnResult = await originalQuery.call(pool, 'SELECT count(*) as active FROM pg_stat_activity WHERE state IS NOT NULL');
    const dbConnCount = parseInt(dbConnResult.rows[0].active);
    
    // Table counts
    const tableStats = await originalQuery.call(pool, `
      SELECT relname as table_name, n_live_tup as row_count 
      FROM pg_stat_user_tables 
      ORDER BY n_live_tup DESC
      LIMIT 10
    `);
    
    // Overall status
    const hasCritical = activeAlerts.some(a => a.severity === 'critical');
    const hasWarning = activeAlerts.some(a => a.severity === 'warning');
    const overallStatus = hasCritical ? 'critical' : hasWarning ? 'warning' : 'healthy';
    
    res.json({
      timestamp: new Date().toISOString(),
      overallStatus,
      uptime: uptimeStr,
      thresholds: THRESHOLDS,
      endpoints: endpointStats,
      database: {
        ...dbStats,
        activeConnections: dbConnCount,
        topTables: tableStats.rows,
      },
      alerts: activeAlerts.slice(0, 20),
      system: systemStats,
    });
  } catch (err) {
    console.error('Monitoring error:', err.message);
    res.status(500).json({ error: 'Monitoring data unavailable', detail: err.message });
  }
});

// GET /api/monitoring/alerts — just alerts
router.get('/monitoring/alerts', async (req, res) => {
  const now = Date.now();
  const activeAlerts = metrics.alerts.filter(a => {
    const age = now - new Date(a.timestamp).getTime();
    return age < 24 * 60 * 60 * 1000;
  });
  res.json({
    count: activeAlerts.length,
    critical: activeAlerts.filter(a => a.severity === 'critical').length,
    warnings: activeAlerts.filter(a => a.severity === 'warning').length,
    alerts: activeAlerts.slice(0, 50),
  });
});

// POST /api/monitoring/reset — clear metrics (useful for testing)
router.post('/monitoring/reset', (req, res) => {
  metrics.endpoints = {};
  metrics.dbQueries = { count: 0, slowQueries: 0, totalMs: 0, slowestMs: 0, slowestQuery: '' };
  metrics.alerts = [];
  metrics.startTime = Date.now();
  res.json({ success: true, message: 'Metrics reset' });
});

export default router;
