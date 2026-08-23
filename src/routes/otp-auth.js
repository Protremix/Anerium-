import express from 'express';
import { pool } from '../db.js';
import { generateToken, sanitizeUser, hashPassword, verifyPassword, verifyToken, JWT_SECRET } from '../auth.js';
import crypto from 'crypto';

const router = express.Router();

// Rate limiter for OTP endpoints (3 attempts per 15 minutes)
const otpAttempts = new Map();
function otpLimiter(req, res, next) {
  const key = req.body.phone_number || req.ip;
  const now = Date.now();
  const window = 15 * 60 * 1000; // 15 min
  const maxAttempts = 5;
  
  const entry = otpAttempts.get(key) || { count: 0, firstAt: now };
  if (now - entry.firstAt > window) {
    otpAttempts.set(key, { count: 1, firstAt: now });
    return next();
  }
  if (entry.count >= maxAttempts) {
    const retryIn = Math.ceil((window - (now - entry.firstAt)) / 1000 / 60);
    return res.status(429).json({ error: `Too many attempts. Try again in ${retryIn} minutes.` });
  }
  entry.count++;
  otpAttempts.set(key, entry);
  next();
}

// Generate 6-digit OTP code
function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Hash OTP code for storage
function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// Format phone to E.164 (basic)
function normalizePhone(phone) {
  let p = phone.replace(/[^0-9+]/g, '');
  if (!p.startsWith('+') && p.length > 10) {
    p = '+' + p;
  } else if (!p.startsWith('+') && p.length === 10) {
    p = '+1' + p; // Default to US
  }
  return p;
}

// Send OTP via SMS (Twilio if configured, otherwise dev mode)
async function sendOtpSms(phoneNumber, code) {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  
  if (twilioSid && twilioToken && twilioFrom) {
    // Production: send via Twilio
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioFrom,
            To: phoneNumber,
            Body: `Your ANERIUM OnePass verification code is: ${code}. It expires in 5 minutes. Do not share this code with anyone.`,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Twilio error');
      return { sent: true, method: 'sms', dev: false };
    } catch (err) {
      console.error('Twilio SMS error:', err.message);
      return { sent: false, method: 'sms', dev: false, error: err.message };
    }
  }
  
  // Dev mode: return code in response (no SMS sent)
  console.log(`[DEV OTP] Code ${code} for ${phoneNumber}`);
  return { sent: false, method: 'dev', dev: true, code };
}

/**
 * POST /api/apps/:appId/auth/send-otp
 * Sends a 6-digit OTP to the provided phone number
 */
router.post('/apps/:appId/auth/send-otp', otpLimiter, async (req, res) => {
  try {
    const { phone_number, delivery_method } = req.body;
    
    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const normalizedPhone = normalizePhone(phone_number);
    if (normalizedPhone.length < 11) {
      return res.status(400).json({ error: 'Invalid phone number format. Include country code, e.g. +34612345678' });
    }
    
    // Check if phone is already registered and verified
    const existing = await pool.query(
      'SELECT id, phone_verified FROM users WHERE phone = $1 AND phone_verified = true',
      [normalizedPhone]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'This phone number is already verified' });
    }
    
    // Generate OTP code
    const code = generateOtpCode();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Store in otp_codes table (invalidate previous codes for this phone)
    await pool.query(
      'UPDATE otp_codes SET verified = true WHERE phone_number = $1 AND verified = false',
      [normalizedPhone]
    );
    
    await pool.query(
      `INSERT INTO otp_codes (id, phone_number, code_hash, delivery_method, expires_at, attempts, verified, created_date, updated_date)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 0, false, NOW(), NOW())`,
      [normalizedPhone, codeHash, delivery_method || 'sms', expiresAt]
    );
    
    // Send OTP
    const result = await sendOtpSms(normalizedPhone, code);
    
    res.json({
      success: true,
      message: result.dev 
        ? 'OTP code generated (dev mode — configure Twilio for SMS)'
        : 'OTP sent to your phone number',
      phone_number: normalizedPhone,
      expires_in: 300, // 5 minutes in seconds
      ...(result.dev ? { dev_code: code } : {}),
    });
  } catch (err) {
    console.error('Send OTP error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

/**
 * POST /api/apps/:appId/auth/verify-phone
 * Verifies the OTP code for a phone number
 */
router.post('/apps/:appId/auth/verify-phone', otpLimiter, async (req, res) => {
  try {
    const { phone_number, code, user_id } = req.body;
    
    if (!phone_number || !code) {
      return res.status(400).json({ error: 'Phone number and OTP code are required' });
    }
    
    const normalizedPhone = normalizePhone(phone_number);
    
    // Find the most recent unverified OTP for this phone
    const otpResult = await pool.query(
      `SELECT * FROM otp_codes 
       WHERE phone_number = $1 AND verified = false 
       ORDER BY created_date DESC LIMIT 1`,
      [normalizedPhone]
    );
    
    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: 'No OTP found. Request a new code.' });
    }
    
    const otp = otpResult.rows[0];
    
    // Check if expired
    if (new Date() > new Date(otp.expires_at)) {
      return res.status(400).json({ error: 'OTP code has expired. Request a new code.' });
    }
    
    // Check attempts (max 5)
    if (otp.attempts >= 5) {
      return res.status(429).json({ error: 'Too many incorrect attempts. Request a new code.' });
    }
    
    // Verify code hash
    const inputHash = hashCode(code);
    if (inputHash !== otp.code_hash) {
      // Increment attempts
      await pool.query(
        'UPDATE otp_codes SET attempts = attempts + 1, updated_date = NOW() WHERE id = $1',
        [otp.id]
      );
      const remaining = 5 - (otp.attempts + 1);
      return res.status(401).json({ 
        error: `Invalid OTP code. ${remaining} attempt(s) remaining.` 
      });
    }
    
    // Code verified! Mark OTP as verified
    await pool.query(
      'UPDATE otp_codes SET verified = true, updated_date = NOW() WHERE id = $1',
      [otp.id]
    );
    
    // If user_id provided, mark their phone as verified
    if (user_id) {
      const updated = await pool.query(
        `UPDATE users 
         SET phone = $1, phone_verified = true, phone_verified_at = NOW(), 
             is_verified = true, verified_date = NOW(), updated_date = NOW()
         WHERE id = $2 RETURNING id, email, full_name, phone, phone_verified`,
        [normalizedPhone, user_id]
      );
      
      if (updated.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.json({
        success: true,
        message: 'Phone number verified successfully',
        user: updated.rows[0],
      });
    }
    
    // No user_id — just verify the phone number (for registration flow)
    res.json({
      success: true,
      message: 'Phone number verified successfully',
      phone_number: normalizedPhone,
      verified: true,
    });
  } catch (err) {
    console.error('Verify phone error:', err.message);
    res.status(500).json({ error: 'Failed to verify phone' });
  }
});

/**
 * POST /api/apps/:appId/auth/register-with-phone
 * Registers a new user with email + password + phone, requires OTP verification
 */
router.post('/apps/:appId/auth/register-with-phone', async (req, res) => {
  try {
    const { email, password, full_name, phone_number, otp_code } = req.body;
    
    if (!email || !password || !phone_number) {
      return res.status(400).json({ error: 'Email, password, and phone number are required' });
    }
    
    const normalizedPhone = normalizePhone(phone_number);
    
    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // If OTP code provided, verify it
    let phoneVerified = false;
    if (otp_code) {
      const otpResult = await pool.query(
        `SELECT * FROM otp_codes 
         WHERE phone_number = $1 AND verified = false 
         ORDER BY created_date DESC LIMIT 1`,
        [normalizedPhone]
      );
      
      if (otpResult.rows.length === 0) {
        return res.status(400).json({ error: 'No OTP found for this phone number. Request a new code.' });
      }
      
      const otp = otpResult.rows[0];
      if (new Date() > new Date(otp.expires_at)) {
        return res.status(400).json({ error: 'OTP code has expired. Request a new code.' });
      }
      
      if (hashCode(otp_code) !== otp.code_hash) {
        return res.status(401).json({ error: 'Invalid OTP code' });
      }
      
      phoneVerified = true;
      // Mark OTP as used
      await pool.query('UPDATE otp_codes SET verified = true WHERE id = $1', [otp.id]);
    }
    
    // Create user
    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);
    
    const result = await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, phone_verified, is_verified, verified_date, role, is_active, created_date, updated_date)
       VALUES ($1, $2, $3, $4, $5, $6, $6, $7, 'user', true, NOW(), NOW()) RETURNING *`,
      [userId, email.toLowerCase(), passwordHash, full_name || null, normalizedPhone, phoneVerified, phoneVerified ? new Date() : null]
    );
    
    const token = generateToken(userId);
    
    res.status(201).json({
      access_token: token,
      user: sanitizeUser(result.rows[0]),
      is_new_user: true,
      phone_verified: phoneVerified,
      ...(phoneVerified ? {} : { 
        message: 'Account created. Verify your phone number to complete registration.',
        next_step: 'POST /api/apps/:appId/auth/send-otp with your phone_number, then verify with /api/apps/:appId/auth/verify-phone'
      }),
    });
  } catch (err) {
    console.error('Register with phone error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/apps/:appId/auth/resend-otp
 * Resends OTP (same rate limiting)
 */
router.post('/apps/:appId/auth/resend-otp', otpLimiter, async (req, res) => {
  // Same as send-otp but explicitly for resending
  try {
    const { phone_number } = req.body;
    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    const normalizedPhone = normalizePhone(phone_number);
    
    // Invalidate previous codes
    await pool.query('UPDATE otp_codes SET verified = true WHERE phone_number = $1 AND verified = false', [normalizedPhone]);
    
    // Generate new code
    const code = generateOtpCode();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    await pool.query(
      `INSERT INTO otp_codes (id, phone_number, code_hash, delivery_method, expires_at, attempts, verified, created_date, updated_date)
       VALUES (gen_random_uuid()::text, $1, $2, 'sms', $3, 0, false, NOW(), NOW())`,
      [normalizedPhone, codeHash, expiresAt]
    );
    
    const result = await sendOtpSms(normalizedPhone, code);
    
    res.json({
      success: true,
      message: result.dev ? 'New OTP code generated (dev mode)' : 'New OTP sent to your phone number',
      expires_in: 300,
      ...(result.dev ? { dev_code: code } : {}),
    });
  } catch (err) {
    console.error('Resend OTP error:', err.message);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

export default router;
