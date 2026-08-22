import express from 'express';
import { pool } from '../db.js';
import { generateToken, sanitizeUser, hashPassword, verifyPassword, verifyToken, revokeToken, generateOtpSecret, verifyOtpCode, generate2FAPendingToken, generateOtpUrl, JWT_SECRET } from '../auth.js';
import { transformRow, getTableColumns, transformToDb } from '../utils/entityName.js';
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/apps/public/prod/public-settings/by-id/:appId
// Returns public app settings that the frontend needs to initialize
router.get('/apps/public/prod/public-settings/by-id/:appId', async (req, res) => {
  try {
    // Return minimal public settings — the frontend just needs to know the app exists
    res.json({
      id: req.params.appId,
      name: 'ANERIUM One Pass',
      status: 'active',
      is_public: true,
      requires_auth: false,
      settings: {
        app_name: 'ANERIUM One Pass',
        primary_color: '#4f46e5',
        locale: 'en',
      },
    });
  } catch (err) {
    console.error('Public settings error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET /api/apps/auth/login - Social auth login (Google) - used by website frontend
// The website's Base44 SDK constructs /apps/auth/{provider}/login?app_id=xxx
router.get('/apps/auth/login', async (req, res) => {
  const appId = '6a7d630d865dd7ed11a16a3c'; // Always use real app ID, ignore 'test' placeholder
  const fromUrl = req.query.from_url || '/';
  const popupOrigin = req.query.popup_origin || '';
  const startUrl = popupOrigin 
    ? `/api/apps/${appId}/auth/google/start?popup_origin=${encodeURIComponent(popupOrigin)}`
    : `/api/apps/${appId}/auth/google/start`;
  res.redirect(302, startUrl);
});

// GET /api/apps/auth/google/login - Google social auth from website
router.get('/apps/auth/google/login', async (req, res) => {
  const appId = '6a7d630d865dd7ed11a16a3c'; // Always use real app ID, ignore 'test' placeholder
  res.redirect(302, `/api/apps/${appId}/auth/google/start`);
});

// GET /api/apps/auth/logout - Social auth logout from website
router.get('/apps/auth/logout', async (req, res) => {
  const fromUrl = req.query.from_url || '/';
  res.redirect(fromUrl);
});

// POST /api/apps/:appId/auth/login
router.post('/apps/:appId/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    if (user.password_hash) {
      if (!verifyPassword(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    
    // Check if user is active
    if (user.is_active === false) {
      return res.status(403).json({ error: 'Account suspended' });
    }
    
    // Check if 2FA is enabled
    if (user.two_factor_enabled && user.otp_secret) {
      const tempToken = generate2FAPendingToken(user.id);
      return res.json({
        requiresOtp: true,
        tempToken: tempToken,
        message: 'Two-factor authentication required'
      });
    }
    
    const token = generateToken(user.id);
    
    res.json({
      access_token: token,
      user: sanitizeUser(transformRow(user)),
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/apps/:appId/auth/register
router.post('/apps/:appId/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, first_name, last_name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    const userId = uuidv4();
    const passwordHash = hashPassword(password);
    const name = full_name || [first_name, last_name].filter(Boolean).join(' ');
    
    const result = await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_date, updated_date)
       VALUES ($1, $2, $3, $4, 'user', true, NOW(), NOW()) RETURNING *`,
      [userId, email.toLowerCase(), passwordHash, name]
    );
    
    const token = generateToken(userId);
    
    res.status(201).json({
      access_token: token,
      user: sanitizeUser(transformRow(result.rows[0])),
      is_new_user: true,
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/apps/:appId/auth/logout — P2-3: Proper session cleanup
router.post('/apps/:appId/auth/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      revokeToken(token);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/apps/auth/logout (for redirect-based logout)
router.get('/apps/auth/logout', async (req, res) => {
  const fromUrl = req.query.from_url || '/';
  res.redirect(fromUrl);
});

// POST /api/apps/:appId/auth/reset-password-request
router.post('/apps/:appId/auth/reset-password-request', async (req, res) => {
  res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
});

// POST /api/apps/:appId/auth/reset-password
router.post('/apps/:appId/auth/reset-password', async (req, res) => {
  res.json({ success: true });
});

// POST /api/apps/:appId/auth/change-password
router.post('/apps/:appId/auth/change-password', async (req, res) => {
  res.json({ success: true });
});

// POST /api/apps/:appId/auth/verify-otp
router.post('/apps/:appId/auth/verify-otp', async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
      return res.status(400).json({ error: 'Temp token and OTP code required' });
    }
    
    // Verify temp token
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded.twoFactorPending) {
      return res.status(401).json({ error: 'Invalid temp token' });
    }
    
    // Get user
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    if (!user.two_factor_enabled || !user.otp_secret) {
      return res.status(400).json({ error: '2FA not enabled for this account' });
    }
    
    // Verify OTP code
    if (!verifyOtpCode(code, user.otp_secret)) {
      return res.status(401).json({ error: 'Invalid OTP code' });
    }
    
    // Generate JWT
    const token = generateToken(user.id);
    res.json({
      access_token: token,
      user: sanitizeUser(transformRow(user)),
    });
  } catch (err) {
    console.error('OTP verify error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/apps/:appId/auth/enable-2fa
router.post('/apps/:appId/auth/enable-2fa', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const secret = generateOtpSecret();
    await pool.query('UPDATE users SET otp_secret = $1 WHERE id = $2', [secret, user.id]);
    
    const otpUrl = generateOtpUrl(secret, user.email);
    res.json({
      secret: secret,
      otpUrl: otpUrl,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpUrl)}`
    });
  } catch (err) {
    console.error('Enable 2FA error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/apps/:appId/auth/confirm-2fa
router.post('/apps/:appId/auth/confirm-2fa', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (!user.otp_secret) {
      return res.status(400).json({ error: 'No OTP secret set. Call enable-2fa first.' });
    }
    
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'OTP code required' });
    }
    
    if (!verifyOtpCode(code, user.otp_secret)) {
      return res.status(401).json({ error: 'Invalid OTP code' });
    }
    
    // Enable 2FA
    await pool.query('UPDATE users SET two_factor_enabled = true WHERE id = $1', [user.id]);
    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (err) {
    console.error('Confirm 2FA error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/apps/:appId/auth/resend-otp
router.post('/apps/:appId/auth/resend-otp', async (req, res) => {
  res.json({ success: true });
});


// GET /api/apps/:appId/auth/google/start
// Redirects to Google's OAuth consent screen
router.get('/apps/:appId/auth/google/start', async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      return res.status(500).send('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
    }
    
    const appId = req.params.appId;
    const redirectUri = `https://anerium.com/api/apps/${appId}/auth/google/callback`;
    const scope = 'openid email profile';
    const popupOrigin = req.query.popup_origin || '';
    const state = popupOrigin ? `${popupOrigin}:${Math.random().toString(36).substring(2, 15)}` : Math.random().toString(36).substring(2, 15);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${encodeURIComponent(state)}`;
    
    res.redirect(authUrl);
  } catch (err) {
    console.error('Google start error:', err.message);
    res.status(500).send('Failed to start Google authentication');
  }
});

// GET /api/apps/:appId/auth/google/callback
// Handles Google's redirect, exchanges code, redirects to app
router.get('/apps/:appId/auth/google/callback', async (req, res) => {
  try {
    const { code, error, state } = req.query;
    // Extract popup_origin from state (format: 'origin:random' or just 'random')
    const popupOrigin = state && state.includes(':') ? state.substring(0, state.lastIndexOf(':')) : '';
    const appId = req.params.appId;
    
    // Helper: redirect to app (deep link) or web callback (popup)
    function authRedirect(url) {
      if (popupOrigin) {
        const params = new URLSearchParams(url.split('?')[1] || '');
        res.redirect(`/auth-callback.html?${params.toString()}`);
      } else {
        // Use intermediate HTML page for reliable deep link redirect on mobile
        const params = new URLSearchParams(url.split('?')[1] || '');
        res.redirect(`/mobile-callback.html?${params.toString()}`);
      }
    }
    
    if (error) {
      authRedirect(`anerium://redirect?error=${encodeURIComponent(error)}`);
      return;
    }
    
    if (!code) {
      authRedirect(`anerium://redirect?error=no_code`);
      return;
    }
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `https://anerium.com/api/apps/${appId}/auth/google/callback`;
    
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Google token exchange error:', errText);
      authRedirect(`anerium://redirect?error=token_exchange_failed`);
      return;
    }
    
    const tokens = await tokenRes.json();
    
    // Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    if (!userRes.ok) {
      console.error('Google userinfo error:', await userRes.text());
      authRedirect(`anerium://redirect?error=userinfo_failed`);
      return;
    }
    
    const googleUser = await userRes.json();
    const email = googleUser.email?.toLowerCase();
    
    if (!email) {
      authRedirect(`anerium://redirect?error=no_email`);
      return;
    }
    
    // Find or create user
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
      if (!user.account_verified) {
        // account_verified column does not exist - skipped
      }
    }
    
    if (user.is_active === false) {
      authRedirect(`anerium://redirect?error=account_suspended`);
      return;
    }
    
    const token = generateToken(user.id);
    const userJson = encodeURIComponent(JSON.stringify(transformRow(user)));
    
    // Check if this is a website popup flow (has popup_origin in state)
    if (popupOrigin) {
      // Website popup flow: redirect to a web page that postMessages the token
      res.redirect(`/auth-callback.html?token=${token}&is_new_user=${result.rows.length === 0}`);
    } else {
      // Mobile app flow: redirect via intermediate HTML page for reliable deep link
      res.redirect(`/mobile-callback.html?token=${token}&user=${userJson}`);
    }
  } catch (err) {
    console.error('Google callback error:', err.message);
    authRedirect(`anerium://redirect?error=server_error`);
  }
});


// GET /api/auth/google/start - Start Google OAuth flow
router.get('/auth/google/start', async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      return res.status(500).send('Google OAuth is not configured');
    }
    
    const redirectUri = 'https://anerium.com/api/auth/google/callback';
    const scope = 'openid email profile';
    const state = Math.random().toString(36).substring(2, 15);
    
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
      'client_id=' + encodeURIComponent(clientId) +
      '&redirect_uri=' + encodeURIComponent(redirectUri) +
      '&response_type=code' +
      '&scope=' + encodeURIComponent(scope) +
      '&state=' + state;
    
    res.redirect(authUrl);
  } catch (err) {
    console.error('Google start error:', err.message);
    res.status(500).send('Failed to start Google authentication');
  }
});

// GET /api/auth/google/callback - Handle Google's redirect
router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      res.redirect(`/mobile-callback.html?error=${encodeURIComponent(error)}`);
      return;
    }
    if (!code) {
      res.redirect('/mobile-callback.html?error=no_code');
      return;
    }
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = 'https://anerium.com/api/auth/google/callback';
    
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenRes.ok) {
      console.error('Google token exchange error:', await tokenRes.text());
      res.redirect('/mobile-callback.html?error=token_exchange_failed');
      return;
    }
    
    const tokens = await tokenRes.json();
    
    // Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: 'Bearer ' + tokens.access_token },
    });
    
    if (!userRes.ok) {
      console.error('Google userinfo error:', await userRes.text());
      res.redirect('/mobile-callback.html?error=userinfo_failed');
      return;
    }
    
    const googleUser = await userRes.json();
    const email = googleUser.email?.toLowerCase();
    
    if (!email) {
      res.redirect('/mobile-callback.html?error=no_email');
      return;
    }
    
    // Find or create user
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
      if (!user.account_verified) {
        // account_verified column does not exist - skipped
      }
    }
    
    if (user.is_active === false) {
      res.redirect('/mobile-callback.html?error=account_suspended');
      return;
    }
    
    const token = generateToken(user.id);
    const userJson = encodeURIComponent(JSON.stringify(transformRow(user)));
    
    res.redirect('/mobile-callback.html?token=' + token + '&user=' + userJson);
  } catch (err) {
    console.error('Google callback error:', err.message);
    res.redirect('anerium://redirect?error=server_error');
  }
});

export default router;

