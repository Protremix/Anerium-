import { createRequire as createRequireOtp } from "module";
const otpRequire = createRequireOtp(import.meta.url);
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';
import { transformRow } from './utils/entityName.js';
import { v4 as uuidv4 } from 'uuid';

// P2-2: Fail fast if JWT_SECRET is not set — no hardcoded fallback
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required. Server cannot start.');
}

// P2-1: In-memory token blacklist (jti -> expiry timestamp)
const tokenBlacklist = new Map();

// Clean up expired blacklist entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [jti, expiry] of tokenBlacklist) {
    if (expiry < now) tokenBlacklist.delete(jti);
  }
}, 10 * 60 * 1000);

// P2-1: Revoke a token by adding its jti to the blacklist
export function revokeToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.jti) {
      tokenBlacklist.set(decoded.jti, (decoded.exp || 0) * 1000);
    }
    return true;
  } catch {
    return false;
  }
}

// P2-1: Check if a token's jti is revoked
export function isTokenRevoked(jti) {
  return jti ? tokenBlacklist.has(jti) : false;
}

// P2-1: Get blacklist size (for monitoring/debugging)
export function getBlacklistSize() {
  return tokenBlacklist.size;
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // P2-1: Check blacklist
    if (decoded.jti && tokenBlacklist.has(decoded.jti)) {
      return null; // Token has been revoked
    }
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch {
    return null;
  }
}

// P2-4: Add jti (unique JWT ID) to make each token unique
export function generateToken(userId) {
  return jwt.sign({ userId, jti: uuidv4() }, JWT_SECRET, { expiresIn: '7d' });
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, passwordHash, ...safe } = user;
  return safe;
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export { JWT_SECRET };

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { authenticator } = require("otplib");
// ============ TOTP / 2FA FUNCTIONS ============
const { generateSecret, generateSync, verifySync, generateURI } = otpRequire("otplib");

// Generate a new TOTP secret for a user
export function generateOtpSecret() {
  return generateSecret();
}

// Verify a TOTP code against a secret
export function verifyOtpCode(token, secret) {
  try {
    const result = verifySync({ token, secret }); return !!(result && result.valid);
  } catch {
    return false;
  }
}

// Generate a temporary 2FA pending token (5 min expiry)
export function generate2FAPendingToken(userId) {
  return jwt.sign({ userId, twoFactorPending: true }, JWT_SECRET, { expiresIn: '5m' });
}

// Generate OTP auth URL for QR code (Google Authenticator compatible)
export function generateOtpUrl(secret, email) {
  return generateURI({ secret, account: email, issuer: 'ANERIUM OnePass' });
}
