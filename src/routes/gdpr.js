import express from 'express';
import { pool } from '../db.js';
import { verifyToken } from '../auth.js';

const router = express.Router();

// Auth middleware
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.use('/apps/:appId/gdpr', requireAuth);

/**
 * GDPR Article 20 — Right to data portability
 * GET /api/apps/:appId/gdpr/export-data
 * Exports all user data as JSON
 */
router.get('/apps/:appId/gdpr/export-data', async (req, res) => {
  const userId = req.user.id;
  const client = await pool.connect();
  
  try {
    const exportData = {
      exportedAt: new Date().toISOString(),
      userId: userId,
      personalData: {},
      activityData: {},
      preferences: {}
    };

    // User profile
    const userResult = await client.query(
      'SELECT id, email, full_name, phone, created_date, updated_date FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    exportData.personalData = userResult.rows[0];

    // Helper: safe query that skips non-existent tables/columns
    async function safeQuery(label, sql, params) {
      try {
        const r = await client.query(sql, params);
        exportData.activityData[label] = r.rows;
      } catch (e) {
        exportData.activityData[label] = [];
      }
    }

    // Reviews use customer_id, not user_id
    await safeQuery('reviews', 'SELECT * FROM reviews WHERE customer_id = $1', [userId]);
    await safeQuery('favorites', 'SELECT * FROM favorites WHERE user_id = $1', [userId]);
    // Transactions use customer_id, not user_id
    await safeQuery('transactions', 'SELECT * FROM transactions WHERE customer_id = $1', [userId]);
    await safeQuery('bookings', 'SELECT * FROM bookings WHERE user_id = $1', [userId]);
    await safeQuery('notifications', 'SELECT * FROM notifications WHERE user_id = $1', [userId]);
    await safeQuery('subscriptions', 'SELECT * FROM subscriptions WHERE user_id = $1', [userId]);
    await safeQuery('memberships', 'SELECT * FROM user_memberships WHERE user_id = $1', [userId]);
    await safeQuery('loyaltyPoints', 'SELECT * FROM loyalty_points WHERE user_id = $1', [userId]);
    await safeQuery('savings', 'SELECT * FROM savings WHERE user_id = $1', [userId]);
    await safeQuery('supportTickets', 'SELECT * FROM support_tickets WHERE user_id = $1', [userId]);
    await safeQuery('chatMessages', 'SELECT * FROM chat_messages WHERE user_id = $1', [userId]);
    await safeQuery('qrCodes', 'SELECT * FROM qr_codes WHERE user_id = $1', [userId]);
    await safeQuery('sessions', 'SELECT * FROM sessions WHERE user_id = $1', [userId]);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-export-${userId}.json"`);
    res.json(exportData);

  } catch (err) {
    console.error('GDPR export error:', err.message);
    res.status(500).json({ error: 'Failed to export data' });
  } finally {
    client.release();
  }
});

/**
 * GDPR Article 17 — Right to erasure (right to be forgotten)
 * DELETE /api/apps/:appId/gdpr/delete-account
 * Deletes all user data. This action is irreversible.
 */
router.delete('/apps/:appId/gdpr/delete-account', async (req, res) => {
  const userId = req.user.id;
  const { confirm } = req.body;
  
  if (confirm !== 'DELETE') {
    return res.status(400).json({ 
      error: 'Confirmation required. Send { "confirm": "DELETE" } to proceed.' 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Collect list of what was deleted for audit
    const deletedRecords = {};

    // Delete in order respecting foreign key constraints
    // Safe delete helper
    async function safeDelete(name, sql, params) {
      try {
        const result = await client.query(sql, params);
        if (result.rowCount > 0) deletedRecords[name] = result.rowCount;
      } catch (e) {
        // Skip non-existent tables/columns
      }
    }

    // Order matters for FK constraints
    await safeDelete('chat_messages', 'DELETE FROM chat_messages WHERE user_id = $1', [userId]);
    await safeDelete('qr_codes', 'DELETE FROM qr_codes WHERE user_id = $1', [userId]);
    await safeDelete('sessions', 'DELETE FROM sessions WHERE user_id = $1', [userId]);
    // Reviews use customer_id
    await safeDelete('reviews', 'DELETE FROM reviews WHERE customer_id = $1', [userId]);
    await safeDelete('favorites', 'DELETE FROM favorites WHERE user_id = $1', [userId]);
    // Transactions use customer_id
    await safeDelete('transactions', 'DELETE FROM transactions WHERE customer_id = $1', [userId]);
    await safeDelete('bookings', 'DELETE FROM bookings WHERE user_id = $1', [userId]);
    await safeDelete('notifications', 'DELETE FROM notifications WHERE user_id = $1', [userId]);
    await safeDelete('subscriptions', 'DELETE FROM subscriptions WHERE user_id = $1', [userId]);
    await safeDelete('user_memberships', 'DELETE FROM user_memberships WHERE user_id = $1', [userId]);
    await safeDelete('loyalty_points', 'DELETE FROM loyalty_points WHERE user_id = $1', [userId]);
    await safeDelete('savings', 'DELETE FROM savings WHERE user_id = $1', [userId]);
    await safeDelete('support_tickets', 'DELETE FROM support_tickets WHERE user_id = $1', [userId]);
    await safeDelete('otp_codes', 'DELETE FROM otp_codes WHERE user_id = $1', [userId]);
    await safeDelete('devices', 'DELETE FROM devices WHERE created_by = $1', [userId]);

    // Anonymize the user record (keep for audit trail but strip PII)
    await client.query(
      `UPDATE users SET 
        email = 'deleted-' || id || '@anonymized.anerium.com',
        full_name = 'Deleted User',
        phone = NULL,
        password_hash = NULL,
        updated_date = NOW()
      WHERE id = $1`,
      [userId]
    );
    deletedRecords.user = 'anonymized';

    // Log the deletion for audit
    await client.query(
      `INSERT INTO audit_logs (id, action, entity_type, entity_id, details, created_date)
       VALUES (gen_random_uuid(), 'GDPR_DELETE', 'User', $1, $2, NOW())`,
      [userId, JSON.stringify(deletedRecords)]
    );

    await client.query('COMMIT');

    res.json({ 
      success: true, 
      message: 'Account data deleted successfully. User record anonymized for audit trail.',
      deletedRecords 
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('GDPR delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete account data' });
  } finally {
    client.release();
  }
});

export default router;
