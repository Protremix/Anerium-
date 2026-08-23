import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import { generateToken, sanitizeUser, verifyToken } from './auth.js';
import { transformRow } from './utils/entityName.js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

import entityRoutes from './routes/entities.js';
import authRoutes from './routes/auth.js';
import functionRoutes from './routes/functions.js';
import monitoringRoutes, { metricsMiddleware } from './routes/monitoring.js';
import gdprRoutes from './routes/gdpr.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(helmet({
    contentSecurityPolicy: false,
    strictTransportSecurity: false,
    xFrameOptions: false,
    referrerPolicy: false,
    xContentTypeOptions: false
}));
const PORT = process.env.PORT || 3001;

// ============ CORS — locked to allowed origins only ============
const ALLOWED_ORIGINS = [
  'https://anerium.com',
  'https://www.anerium.com',
  'https://anerium.de',
  'https://www.anerium.de',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin(origin, callback) {
    // Allow same-origin requests (no Origin header) and allowed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));

// ============ Rate Limiting ============
// Auth endpoints: 100 req/min per IP (stricter for brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: { error: "Too many login attempts. Please try again in 15 minutes." }
});

// General API: 1000 req/min per authenticated user, 100/min per IP if no token
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID as key if authenticated, otherwise fall back to IP
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return `user:${decoded.userId}`;
      } catch {}
    }
    return `ip:${req.ip}`;
  },
  message: { error: 'Rate limit exceeded. Please slow down.' }
});

// Input sanitization — strip HTML/script tags from all string fields
function sanitizeInput(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/<script[^>]*>.*?<\/script>/gi, '')
              .replace(/<[^>]+>/g, '')
              .replace(/javascript:/gi, '');
  }
  if (Array.isArray(obj)) return obj.map(sanitizeInput);
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [k, v] of Object.entries(obj)) {
      cleaned[k] = sanitizeInput(v);
    }
    return cleaned;
  }
  return obj;
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize body AFTER parsing (req.body is populated by json/urlencoded middleware)
app.use((req, res, next) => {
  if (req.body) req.body = sanitizeInput(req.body);
  next();
});

// Health check (no rate limit)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Apply auth limiter to login/register/password endpoints
app.use('/api/apps/:appId/auth/login', authLimiter);
app.use('/api/apps/:appId/auth/register', authLimiter);
app.use('/api/apps/:appId/auth/reset-password', authLimiter);
app.use('/api/apps/:appId/auth/reset-password-request', authLimiter);
app.use('/api/apps/:appId/auth/verify-otp', authLimiter);

// Apply general API limiter to all other /api routes
app.use('/api', apiLimiter);

// Google OAuth routes (at root level to match Google Cloud Console redirect URI)
app.get('/auth/google/start', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    return res.status(500).send('Google OAuth is not configured');
  }
  const redirectUri = 'https://anerium.com/auth/google/callback';
  const scope = 'openid email profile';
  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
    'client_id=' + encodeURIComponent(clientId) +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&response_type=code' +
    '&scope=' + encodeURIComponent(scope) +
    '&state=' + state;
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    if (error) { res.redirect('anerium://redirect?error=' + encodeURIComponent(error)); return; }
    if (!code) { res.redirect('anerium://redirect?error=no_code'); return; }
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = 'https://anerium.com/auth/google/callback';
    
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: redirectUri, grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenRes.ok) {
      console.error('Google token error:', await tokenRes.text());
      res.redirect('anerium://redirect?error=token_exchange_failed');
      return;
    }
    
    const tokens = await tokenRes.json();
    
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: 'Bearer ' + tokens.access_token },
    });
    
    if (!userRes.ok) {
      res.redirect('anerium://redirect?error=userinfo_failed');
      return;
    }
    
    const googleUser = await userRes.json();
    const email = googleUser.email?.toLowerCase();
    if (!email) { res.redirect('anerium://redirect?error=no_email'); return; }
    
    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;
    
    if (result.rows.length === 0) {
      const userId = uuidv4();
      const fullName = googleUser.name || email.split('@')[0];
      result = await pool.query(
        `INSERT INTO users (id, email, full_name, role, is_active, avatar_url, created_date, updated_date)
         VALUES ($1, $2, $3, 'user', true, $4, NOW(), NOW()) RETURNING *`,
        [userId, email, fullName, googleUser.picture || null]
      );
      user = result.rows[0];
    } else {
      user = result.rows[0];
      if (!user.avatar_url && googleUser.picture) {
        await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [googleUser.picture, user.id]);
        user.avatar_url = googleUser.picture;
      }
      
    }
    
    if (user.is_active === false) { res.redirect('anerium://redirect?error=account_suspended'); return; }
    
    const token = generateToken(user.id);
    const userJson = encodeURIComponent(JSON.stringify(sanitizeUser(transformRow(user))));
    res.redirect('anerium://redirect?token=' + token + '&user=' + userJson);
  } catch (err) {
    console.error('Google callback error:', err.message);
    res.redirect('anerium://redirect?error=server_error');
  }
});

// API routes (Base44-compatible)
// Monitoring middleware — track all API endpoint metrics
app.use('/api', metricsMiddleware);
app.use('/api', authRoutes);
app.use('/api', functionRoutes);
app.use('/api', entityRoutes);
app.use('/api', monitoringRoutes);
app.use('/api', gdprRoutes);

// Stub endpoints for analytics/logging that SPA calls but aren't needed self-hosted
app.post('/app-logs/:appId/log-user-in-app/:page', (req, res) => res.json({ ok: true }));
app.post('/apps/test/analytics/track/batch', (req, res) => res.json({ ok: true }));
app.post('/apps/:appId/analytics/track', (req, res) => res.json({ ok: true }));
app.post('/apps/:appId/analytics/track/batch', (req, res) => res.json({ ok: true }));

// Serve static frontend (Vite build)
const distPath = path.join(__dirname, '..', 'public');
app.use(express.static(distPath));

// SPA fallback — all non-API routes serve index.html
// Serve monitoring dashboard
app.get('/monitoring', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'monitoring.html')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ANERIUM backend running on port ${PORT}`);
  console.log(`Serving frontend from ${distPath}`);
});
