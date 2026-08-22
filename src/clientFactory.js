/**
 * Creates a Base44-compatible client for use in function handlers.
 * Mimics the interface of createClientFromRequest from @base44/sdk.
 */
import { pool } from './db.js';
import { entityNameToTableName, getTableColumns, transformRow, transformToDb, toSnakeCase } from './utils/entityName.js';
import { translateQuery, parseSort } from './utils/queryTranslator.js';
import { verifyToken } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

export async function createClientFromRequest(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  let currentUser = null;
  if (token) {
    currentUser = await verifyToken(token);
  }

  function createEntityHandler(entityName) {
    const tableName = entityNameToTableName(entityName);
    return {
      async list(sort, limit, skip) {
        const orderClause = parseSort(sort);
        const limitVal = limit || 100;
        const skipVal = skip || 0;
        const result = await pool.query(`SELECT * FROM ${tableName} ${orderClause} LIMIT ${limitVal} OFFSET ${skipVal}`);
        return result.rows.map(transformRow);
      },
      async filter(query, sort, limit, skip) {
        const columns = await getTableColumns(pool, tableName);
        const { where, params } = translateQuery(query, columns);
        const orderClause = parseSort(sort);
        const limitVal = limit || 100;
        const skipVal = skip || 0;
        const result = await pool.query(`SELECT * FROM ${tableName} ${where} ${orderClause} LIMIT ${limitVal} OFFSET ${skipVal}`, params);
        return result.rows.map(transformRow);
      },
      async get(id) {
        const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
        return result.rows.length > 0 ? transformRow(result.rows[0]) : null;
      },
      async create(data) {
        const columns = await getTableColumns(pool, tableName);
        const dbData = transformToDb(data, columns);
        if (!dbData.id) dbData.id = uuidv4();
        if (currentUser && !dbData.created_by) dbData.created_by = currentUser.id;
        const keys = Object.keys(dbData);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const values = keys.map(k => dbData[k]);
        const result = await pool.query(`INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`, values);
        return transformRow(result.rows[0]);
      },
      async update(id, data) {
        const columns = await getTableColumns(pool, tableName);
        const dbData = transformToDb(data, columns);
        const keys = Object.keys(dbData);
        if (keys.length === 0) return await this.get(id);
        const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        const values = keys.map(k => dbData[k]);
        values.push(id);
        const result = await pool.query(`UPDATE ${tableName} SET ${setClause}, updated_date = NOW() WHERE id = $${keys.length + 1} RETURNING *`, values);
        return result.rows.length > 0 ? transformRow(result.rows[0]) : null;
      },
      async delete(id) {
        await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
        return { success: true };
      },
      async deleteMany(query) {
        const columns = await getTableColumns(pool, tableName);
        const { where, params } = translateQuery(query, columns);
        const result = await pool.query(`DELETE FROM ${tableName} ${where}`, params);
        return { deleted: result.rowCount };
      },
    };
  }

  const entitiesProxy = new Proxy({}, {
    get(_, entityName) {
      if (typeof entityName !== 'string' || entityName === 'then' || entityName.startsWith('_')) return undefined;
      return createEntityHandler(entityName);
    },
  });

  return {
    entities: entitiesProxy,
    asServiceRole: {
      entities: entitiesProxy,
      integrations: { Core: { SendEmail: async (o) => { console.log('[Email]', o.to, o.subject); return { success: true }; } } },
    },
    auth: {
      async me() { return currentUser ? transformRow(currentUser) : null; },
      async updateMe(data) {
        if (!currentUser) throw new Error('Not authenticated');
        const columns = await getTableColumns(pool, 'users');
        const dbData = transformToDb(data, columns);
        const keys = Object.keys(dbData);
        if (keys.length === 0) return transformRow(currentUser);
        const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        const values = keys.map(k => dbData[k]);
        values.push(currentUser.id);
        const result = await pool.query(`UPDATE users SET ${setClause}, updated_date = NOW() WHERE id = $${keys.length + 1} RETURNING *`, values);
        currentUser = result.rows[0];
        return transformRow(currentUser);
      },
    },
  };
}
