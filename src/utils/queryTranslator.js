/**
 * Translates a MongoDB-style query object to a PostgreSQL WHERE clause + params.
 * Supports: field equality, $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $regex, $or, $and, $exists
 */
import { toSnakeCase } from './entityName.js';

export function translateQuery(query, columns) {
  if (!query || Object.keys(query).length === 0) {
    return { where: '', params: [] };
  }

  const conditions = [];
  const params = [];
  let paramIdx = 1;

  function addCondition(field, operator, value) {
    const col = columns.includes(toSnakeCase(field)) ? toSnakeCase(field) : field;
    
    if (operator === '$eq' || operator === undefined) {
      if (value === null || value === undefined) {
        conditions.push(`${col} IS NULL`);
      } else if (Array.isArray(value)) {
        // Match if the stored value contains any of these (stored as JSON array)
        conditions.push(`(${value.map(v => {
          params.push(`%"${v}"%`);
          return `$${paramIdx++} = ANY(STRING_TO_ARRAY(${col}, ','))`;
        }).join(' OR ')} OR ${col} = ANY($${paramIdx++}))`);
        params.push(value);
      } else {
        conditions.push(`${col} = $${paramIdx++}`);
        params.push(value);
      }
    } else if (operator === '$ne') {
      if (value === null) {
        conditions.push(`${col} IS NOT NULL`);
      } else {
        conditions.push(`(${col} IS DISTINCT FROM $${paramIdx++})`);
        params.push(value);
      }
    } else if (operator === '$gt') {
      conditions.push(`${col} > $${paramIdx++}`);
      params.push(value);
    } else if (operator === '$gte') {
      conditions.push(`${col} >= $${paramIdx++}`);
      params.push(value);
    } else if (operator === '$lt') {
      conditions.push(`${col} < $${paramIdx++}`);
      params.push(value);
    } else if (operator === '$lte') {
      conditions.push(`${col} <= $${paramIdx++}`);
      params.push(value);
    } else if (operator === '$in') {
      if (Array.isArray(value) && value.length > 0) {
        const placeholders = value.map(() => `$${paramIdx++}`).join(',');
        conditions.push(`${col} IN (${placeholders})`);
        params.push(...value);
      }
    } else if (operator === '$nin') {
      if (Array.isArray(value) && value.length > 0) {
        const placeholders = value.map(() => `$${paramIdx++}`).join(',');
        conditions.push(`${col} NOT IN (${placeholders})`);
        params.push(...value);
      }
    } else if (operator === '$regex') {
      // For TEXT columns, use ILIKE
      const pattern = typeof value === 'string' ? value : (value?.$regex || value);
      const flags = typeof value === 'object' ? value?.$options : '';
      const op = flags?.includes('i') ? 'ILIKE' : 'LIKE';
      conditions.push(`${col} ${op} $${paramIdx++}`);
      params.push(`%${pattern}%`);
    } else if (operator === '$exists') {
      if (value) {
        conditions.push(`${col} IS NOT NULL`);
      } else {
        conditions.push(`${col} IS NULL`);
      }
    }
  }

  function processObject(obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$or') {
        const orConditions = [];
        for (const clause of value) {
          const { where, params: subParams } = processObject(clause, paramIdx);
          orConditions.push(`(${where})`);
          params.push(...subParams);
        }
        if (orConditions.length > 0) {
          conditions.push(`(${orConditions.join(' OR ')})`);
        }
      } else if (key === '$and') {
        for (const clause of value) {
          const { where, params: subParams } = processObject(clause, paramIdx);
          if (where) conditions.push(`(${where})`);
          params.push(...subParams);
        }
      } else if (key.startsWith('$')) {
        // Skip unknown operators
        continue;
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Field with operator: { field: { $gt: 5 } }
        for (const [op, opVal] of Object.entries(value)) {
          addCondition(key, op, opVal);
        }
      } else {
        // Field equality: { field: value }
        addCondition(key, '$eq', value);
      }
    }
  }

  processObject(query);

  if (conditions.length === 0) {
    return { where: '', params: [] };
  }

  return {
    where: `WHERE ${conditions.join(' AND ')}`,
    params,
  };
}

/**
 * Parse the sort parameter. Base44 uses "-field" for descending.
 */
export function parseSort(sort) {
  if (!sort) return '';
  const parts = sort.split(',').map(s => {
    s = s.trim();
    if (s.startsWith('-')) {
      return `${toSnakeCase(s.slice(1))} DESC`;
    }
    return `${toSnakeCase(s)} ASC`;
  });
  return `ORDER BY ${parts.join(', ')}`;
}
