import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db.js';
import { entityNameToTableName, toSnakeCase, toCamelCase, getTableColumns, transformRow, transformToDb } from '../utils/entityName.js';
import { translateQuery, parseSort } from '../utils/queryTranslator.js';
import { verifyToken, sanitizeUser } from '../auth.js';

// Sanitize User rows to strip password_hash/passwordHash from API responses
function safeTransform(row, entityName) {
  const transformed = transformRow(row);
  if (entityName === 'User') {
    return sanitizeUser(transformed);
  }
  return transformed;
}


const router = express.Router();

// Auth middleware — require JWT for ALL entity routes
function requireEntityAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Apply auth to ALL entity routes
router.use('/apps/:appId/entities', requireEntityAuth);

// ============ Auth middleware — require JWT for ALL entity routes ============
router.use('/apps/:appId/entities/:entityName', async (req, res, next) => {
  // Skip auth for OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') return next();

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Invalid or expired token' });

    // Attach user to request for downstream use
    req.authUser = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
});

// All entity routes require the appId in the path
// GET /api/apps/:appId/entities/:entityName — list/filter
// GET /api/apps/:appId/entities/:entityName/:id — get by id
// GET /api/apps/:appId/entities/User/me — get current user
// POST /api/apps/:appId/entities/:entityName — create
// POST /api/apps/:appId/entities/:entityName/bulk — bulk create
// PUT /api/apps/:appId/entities/:entityName/:id — update
// PUT /api/apps/:appId/entities/:entityName/bulk — bulk update
// PATCH /api/apps/:appId/entities/:entityName/update-many — update by query
// DELETE /api/apps/:appId/entities/:entityName/:id — delete
// DELETE /api/apps/:appId/entities/:entityName — delete by query

router.get('/apps/:appId/entities/:entityName', async (req, res) => {
  try {
    const { entityName } = req.params;
    const tableName = entityNameToTableName(entityName);
    const columns = await getTableColumns(pool, tableName);
    
    const { q, sort, limit, skip, fields } = req.query;
    
    // Build WHERE clause from query
    let whereClause = '';
    let params = [];
    if (q) {
      const queryObj = JSON.parse(q);
      const translated = translateQuery(queryObj, columns);
      whereClause = translated.where;
      params = translated.params;
    }
    
    // Build SELECT
    let selectCols = '*';
    if (fields) {
      const fieldList = fields.split(',').map(f => toSnakeCase(f.trim()));
      selectCols = fieldList.filter(f => columns.includes(f)).map(f => `"${f}"`).join(', ');
      if (!selectCols) selectCols = '*';
    }
    
    // Build ORDER BY
    const orderClause = parseSort(sort);
    
    // Build LIMIT/OFFSET
    const limitVal = limit ? parseInt(limit) : 100;
    const skipVal = skip ? parseInt(skip) : 0;
    
    const query = `SELECT ${selectCols} FROM ${tableName} ${whereClause} ${orderClause} LIMIT ${limitVal} OFFSET ${skipVal}`;
    const result = await pool.query(query, params);
    
    const rows = result.rows.map(r => safeTransform(r, entityName));
    res.json(rows);
  } catch (err) {
    console.error('Entity list error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Special: User/me
router.get('/apps/:appId/entities/User/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    res.json(sanitizeUser(transformRow(user)));
  } catch (err) {
    console.error('User/me error:', err.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// PUT User/me
router.put('/apps/:appId/entities/User/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    const columns = await getTableColumns(pool, 'users');
    const dbData = transformToDb(req.body, columns);
    
    // Update user
    const keys = Object.keys(dbData);
    if (keys.length === 0) {
      return res.json(sanitizeUser(transformRow(user)));
    }
    
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = keys.map(k => dbData[k]);
    values.push(user.id);
    
    const result = await pool.query(
      `UPDATE users SET ${setClause}, updated_date = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      values
    );
    
    res.json(sanitizeUser(transformRow(result.rows[0])));
  } catch (err) {
    console.error('Update me error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET by id
router.get('/apps/:appId/entities/:entityName/:id', async (req, res) => {
  try {
    const { entityName, id } = req.params;
    // Skip if this is User/me (already handled above)
    if (entityName === 'User' && id === 'me') return;
    
    const tableName = entityNameToTableName(entityName);
    const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json(safeTransform(result.rows[0], entityName));
  } catch (err) {
    console.error('Entity get error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST — create
router.post('/apps/:appId/entities/:entityName', async (req, res) => {
  try {
    const { entityName } = req.params;
    const tableName = entityNameToTableName(entityName);
    const columns = await getTableColumns(pool, tableName);
    
    // Add standard fields
    const data = { ...req.body };
    const dbData = transformToDb(data, columns);
    
    // Generate ID if not provided
    if (!dbData.id) {
      dbData.id = uuidv4();
    }
    
    // Set timestamps (both NOT NULL in all tables)
    if (!dbData.created_date) {
      dbData.created_date = new Date().toISOString();
    }
    if (!dbData.updated_date) {
      dbData.updated_date = new Date().toISOString();
    }
    
    // Set common NOT NULL defaults
    if (columns.includes('is_active') && dbData.is_active === undefined) dbData.is_active = false;
    if (columns.includes('used_count') && dbData.used_count === undefined) dbData.used_count = 0;
    if (columns.includes('view_count') && dbData.view_count === undefined) dbData.view_count = 0;
    if (columns.includes('sort_order') && dbData.sort_order === undefined) dbData.sort_order = 0;
    if (columns.includes('premium_only') && dbData.premium_only === undefined) dbData.premium_only = false;
    if (columns.includes('is_featured') && dbData.is_featured === undefined) dbData.is_featured = false;
    if (columns.includes('is_limited_time') && dbData.is_limited_time === undefined) dbData.is_limited_time = false;
    
    // Set created_by from auth token if available
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const user = await verifyToken(token);
        if (user && !dbData.created_by) {
          dbData.created_by = user.id;
        }
      } catch {}
    }
    
    const keys = Object.keys(dbData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const values = keys.map(k => dbData[k]);
    
    const result = await pool.query(
      `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    
    res.status(201).json(safeTransform(result.rows[0], entityName));
  } catch (err) {
    console.error('Entity create error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST bulk
router.post('/apps/:appId/entities/:entityName/bulk', async (req, res) => {
  try {
    const { entityName } = req.params;
    const tableName = entityNameToTableName(entityName);
    const columns = await getTableColumns(pool, tableName);
    
    const items = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];
    
    for (const item of items) {
      const dbData = transformToDb(item, columns);
      if (!dbData.id) dbData.id = uuidv4();
      
      const keys = Object.keys(dbData);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const values = keys.map(k => dbData[k]);
      
      const result = await pool.query(
        `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      results.push(safeTransform(result.rows[0], entityName));
    }
    
    res.status(201).json(results);
  } catch (err) {
    console.error('Entity bulk create error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT by id — update
router.put('/apps/:appId/entities/:entityName/:id', async (req, res) => {
  try {
    const { entityName, id } = req.params;
    const tableName = entityNameToTableName(entityName);
    const columns = await getTableColumns(pool, tableName);
    
    const dbData = transformToDb(req.body, columns);
    const keys = Object.keys(dbData);
    
    if (keys.length === 0) {
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
      return res.json(safeTransform(result.rows[0], entityName));
    }
    
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = keys.map(k => dbData[k]);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE ${tableName} SET ${setClause}, updated_date = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json(safeTransform(result.rows[0], entityName));
  } catch (err) {
    console.error('Entity update error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH update-many
router.patch('/apps/:appId/entities/:entityName/update-many', async (req, res) => {
  try {
    const { entityName } = req.params;
    const tableName = entityNameToTableName(entityName);
    const columns = await getTableColumns(pool, tableName);
    
    const { query, data } = req.body;
    const { where, params } = translateQuery(query, columns);
    const dbData = transformToDb(data, columns);
    
    const keys = Object.keys(dbData);
    if (keys.length === 0) {
      return res.json({ modified: 0 });
    }
    
    const setClause = keys.map((k, i) => `${k} = $${params.length + i + 1}`).join(', ');
    const allParams = [...params, ...keys.map(k => dbData[k])];
    
    const result = await pool.query(
      `UPDATE ${tableName} SET ${setClause}, updated_date = NOW() ${where}`,
      allParams
    );
    
    res.json({ modified: result.rowCount });
  } catch (err) {
    console.error('Entity update-many error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE by id
router.delete('/apps/:appId/entities/:entityName/:id', async (req, res) => {
  try {
    const { entityName, id } = req.params;
    const tableName = entityNameToTableName(entityName);
    
    await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Entity delete error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE by query
router.delete('/apps/:appId/entities/:entityName', async (req, res) => {
  try {
    const { entityName } = req.params;
    const tableName = entityNameToTableName(entityName);
    const columns = await getTableColumns(pool, tableName);
    
    const query = req.body || {};
    const { where, params } = translateQuery(query, columns);
    
    const result = await pool.query(`DELETE FROM ${tableName} ${where}`, params);
    res.json({ deleted: result.rowCount });
  } catch (err) {
    console.error('Entity delete-many error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
