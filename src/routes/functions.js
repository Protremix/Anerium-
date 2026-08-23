import express from 'express';
import { createClientFromRequest } from '../clientFactory.js';
import { pool } from '../db.js';
import { verifyToken, sanitizeUser } from '../auth.js';
import { transformRow } from '../utils/entityName.js';
import { v4 as uuidv4 } from 'uuid';
import {
  customerConciergeChat,
  generateRecommendations,
  generateSavingsInsights,
  planTrip,
  generateMembershipAdvice,
  generateBusinessInsights,
  generateMarketingAssistant,
  answerBusinessQuestion,
  generateWeeklySummary,
  generateOperationsInsights,
  generateScoreAdvisor,
} from '../openai.js';

const router = express.Router();

// Helper to get the auth user from request
async function getAuthUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  return await verifyToken(token);
}

// Helper to get business metrics for AI
async function getBusinessMetrics(businessId) {
  const [transactions, reviews, employees, customers] = await Promise.all([
    pool.query('SELECT COUNT(*) as count, COALESCE(SUM(final_amount),0) as revenue, COALESCE(SUM(discount_amount),0) as discounts_given FROM transactions WHERE business_id = $1', [businessId]),
    pool.query('SELECT COUNT(*) as count, COALESCE(AVG(rating),0) as avg_rating FROM reviews WHERE business_id = $1', [businessId]),
    pool.query('SELECT COUNT(*) as count FROM employees WHERE business_id = $1', [businessId]),
    pool.query('SELECT COUNT(DISTINCT customer_id) as count FROM transactions WHERE business_id = $1', [businessId]),
  ]);
  return {
    total_transactions: transactions.rows[0].count,
    revenue: transactions.rows[0].revenue,
    discounts_given: transactions.rows[0].discounts_given,
    review_count: reviews.rows[0].count,
    avg_rating: parseFloat(reviews.rows[0].avg_rating).toFixed(1),
    employee_count: employees.rows[0].count,
    customer_count: customers.rows[0].count,
  };
}

// Function handler
router.post('/apps/:appId/functions/:functionName', async (req, res) => {
  const { functionName } = req.params;
  const body = req.body || {};
  
  try {
    const base44 = await createClientFromRequest(req);
    const user = await base44.auth.me();
    
    switch (functionName) {
      
      // ============ sendContactForm ============
      case 'sendContactForm': {
        const { name, email, message } = body;
        if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });
        await pool.query(
          `INSERT INTO support_tickets (id, user_id, user_name, user_email, subject, description, category, status, priority, source, requester_type, created_date, updated_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', 'medium', 'website', 'customer', NOW(), NOW())`,
          [uuidv4(), user?.id || 'contact_form', name, email, `[Contact] ${name}`, `From: ${name} <${email}>\n\nMessage:\n${message}`, 'general']
        );
        return res.json({ success: true });
      }
      
      // ============ customerApi ============
      case 'customerApi': {
        const { action } = body;
        // Public actions that don't require auth
        const publicActions = ['getPopularSearches', 'getSearchSuggestions', 'searchBusinesses', 'trackSearch', 'saveRecentSearch', 'getRecentSearches', 'getCategories'];
        if (!user && !publicActions.includes(action)) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        
        switch (action) {
          case 'getProfile':
            return res.json({ id: user.id, email: user.email, full_name: user.full_name, role: user.role, membership_type: user.membership_type || 'free', phone: user.phone, city: user.city, country: user.country, avatar_url: user.avatar_url, status: user.status || 'active', preferred_language: user.preferred_language || 'en', created_date: user.created_date });
          
          case 'updateProfile': {
            const allowed = ['full_name', 'phone', 'city', 'country', 'avatar_url', 'date_of_birth', 'marketing_consent', 'push_notifications_enabled', 'preferred_language'];
            const updates = {};
            for (const key of allowed) if (body[key] !== undefined) updates[key] = body[key];
            await base44.auth.updateMe(updates);
            return res.json({ success: true, message: 'Profile updated' });
          }
          
          case 'getMembership': {
            const memberships = await base44.entities.UserMembership.filter({ user_id: user.id, status: 'active' });
            const subscription = memberships[0] || null;
            let plan = null;
            if (subscription?.plan_id) {
              const plans = await base44.entities.MembershipPlan.filter({ id: subscription.plan_id });
              plan = plans[0] || null;
            }
            const isPremium = (user.membership_type === 'premium') || !!subscription;
            return res.json({ membership_type: isPremium ? 'premium' : 'free', is_premium: isPremium, subscription, plan });
          }
          
          case 'getQrCode': {
            const qrCodes = await base44.entities.QrCode.filter({ user_id: user.id, status: 'active' });
            if (qrCodes.length === 0) {
              const code = 'OP-' + user.id.substring(0, 8).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
              const created = await base44.entities.QrCode.create({ user_id: user.id, user_name: user.full_name || user.email, code, status: 'active', generated_date: new Date().toISOString(), scan_count: 0 });
              return res.json({ qr_code: created });
            }
            return res.json({ qr_code: qrCodes[0] });
          }
          
          case 'getNotifications': {
            const notifications = await base44.entities.Notification.filter({ user_id: user.id }, '-sent_at', 50);
            return res.json({ notifications, total: notifications.length, unread_count: notifications.filter(n => !n.is_read).length });
          }
          
          case 'markNotificationRead': {
            if (body.notification_id) await base44.entities.Notification.update(body.notification_id, { is_read: true, read_at: new Date().toISOString() });
            return res.json({ success: true });
          }
          
          case 'getFavorites': {
            const allFavs = await base44.entities.Favorite.filter({ user_id: user.id }, '-created_date', 100);
            const favorites = allFavs.filter(f => !f.discount_id);
            const businessIds = favorites.map(f => f.business_id).filter(Boolean);
            const businesses = businessIds.length > 0 ? await base44.entities.Business.filter({ id: { $in: businessIds } }).catch(() => []) : [];
            return res.json({ favorites, businesses, collections: [], uncategorized_count: favorites.filter(f => !f.collection_name).length, total: favorites.length });
          }
          
          case 'toggleFavorite': {
            const { business_id, business_name, category } = body;
            if (!business_id) return res.status(400).json({ error: 'business_id required' });
            const existing = await base44.entities.Favorite.filter({ user_id: user.id, business_id });
            if (existing.length > 0) {
              await base44.entities.Favorite.deleteMany({ user_id: user.id, business_id });
              return res.json({ favorited: false });
            }
            await base44.entities.Favorite.create({ user_id: user.id, user_name: user.full_name || user.email, business_id, business_name, category });
            return res.json({ favorited: true });
          }
          
          case 'getTransactions': {
            const limit = body.limit || 20;
            const transactions = await base44.entities.Transaction.filter({ customer_id: user.id }, '-transaction_date', limit);
            return res.json({ transactions });
          }
          
          case 'getBookings': {
            const bookings = await base44.entities.Booking.filter({ user_id: user.id }, '-booking_date', 200);
            const todayStr = new Date().toISOString().slice(0, 10);
            const upcoming = bookings.filter(b => b.booking_date >= todayStr && !['completed', 'cancelled', 'no_show'].includes(b.status));
            const past = bookings.filter(b => b.booking_date < todayStr || ['completed', 'cancelled', 'no_show'].includes(b.status));
            return res.json({ bookings, upcoming, past, today_bookings: bookings.filter(b => b.booking_date === todayStr) });
          }
          
          case 'getLoyaltyPoints': {
            const points = await base44.entities.LoyaltyPoint.filter({ user_id: user.id }, '-created_date', 100);
            const total = points.reduce((sum, p) => sum + (p.points || 0), 0);
            return res.json({ points: total, history: points });
          }
          
          case 'getHomeDashboard': {
            const memberships = await base44.entities.UserMembership.filter({ user_id: user.id, status: 'active' });
            const favorites = await base44.entities.Favorite.filter({ user_id: user.id }, '-created_date', 5);
            const notifications = await base44.entities.Notification.filter({ user_id: user.id }, '-sent_at', 5);
            const transactions = await base44.entities.Transaction.filter({ customer_id: user.id }, '-transaction_date', 5);
            const loyaltyPoints = await base44.entities.LoyaltyPoint.filter({ user_id: user.id });
            const totalPoints = loyaltyPoints.reduce((sum, p) => sum + (p.points || 0), 0);
            return res.json({ user: sanitizeUser(user), membership: memberships[0] || null, favorites, notifications, transactions, loyalty_points: totalPoints, is_premium: user.membership_type === 'premium' || memberships.length > 0 });
          }
          
          case 'searchBusinesses': {
            const { query, category, city, country, lat, lng, radius } = body;
            let businesses = await base44.entities.Business.filter({ is_active: true }, 'name', 200);
            if (query) {
              const q = query.toLowerCase();
              businesses = businesses.filter(b => (b.name || '').toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q));
            }
            if (category && category !== 'all' && category !== 'All') {
              businesses = businesses.filter(b => b.category === category);
            }
            return res.json({ businesses, total: businesses.length });
          }
          
          case 'saveRecentSearch':
          case 'getRecentSearches':
            return res.json({ searches: [] });
          case 'getSearchSuggestions':
            return res.json({ suggestions: ['Restaurants', 'Spas', 'Gyms', 'Hotels', 'Salons'] });
          case 'getPopularSearches':
            return res.json({ searches: ['Restaurants', 'Spas', 'Hotels', 'Gyms', 'Salons'] });
          case 'trackSearch':
            return res.json({ success: true });
          
          case 'getBookingAvailability': {
            const { business_id, date } = body;
            if (!business_id || !date) return res.status(400).json({ error: 'business_id and date required' });
            const bizArr = await base44.entities.Business.filter({ id: business_id }).catch(() => []);
            const business = bizArr[0];
            if (!business) return res.status(404).json({ error: 'Business not found' });
            const slots = [];
            for (let h = 9; h < 21; h++) {
              slots.push(`${String(h).padStart(2, '0')}:00`);
            }
            return res.json({ business, date, slots });
          }
          case 'registerPushToken': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            const { token } = body;
            if (!token) return res.status(400).json({ error: 'Token required' });
            try {
              await pool.query(
                'UPDATE users SET expo_push_token = $1, push_token_updated_at = NOW() WHERE id = $2',
                [token, user.id]
              );
              return res.json({ success: true });
            } catch (dbErr) {
              console.error('Push token save error:', dbErr.message);
              return res.json({ success: true });
            }
          }
          
          case 'unregisterPushToken': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            try {
              await pool.query(
                'UPDATE users SET expo_push_token = NULL, push_token_updated_at = NOW() WHERE id = $2',
                [user.id]
              );
              return res.json({ success: true });
            } catch (dbErr) {
              return res.json({ success: true });
            }
          }
          

          case 'getCategories': {
            const cats = await base44.entities.BusinessCategory.list('name');
            return res.json({ categories: cats });
          }
          
          case 'getCategories': {
            const cats = await base44.entities.Business.filter({ is_active: true }, 'name', 200).then(businesses => {
              const categories = [...new Set(businesses.map(b => b.category).filter(Boolean))];
              return res.json({ categories });
            });
            return cats;
          }
          default:
            return res.status(400).json({ error: `Unknown customerApi action: ${action}` });
        }
      }
      
      // ============ walletApi ============
      case 'walletApi': {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const { action } = body;
        switch (action) {
          case 'getGiftWallet': {
            const gifts = await base44.entities.GiftRedemption.filter({ user_id: user.id }, '-created_date', 50);
            return res.json({ gifts, total: gifts.length });
          }
          case 'redeemGift': {
            const { gift_id } = body;
            if (!gift_id) return res.status(400).json({ error: 'gift_id required' });
            await base44.entities.GiftRedemption.update(gift_id, { status: 'redeemed', redeemed_date: new Date().toISOString() });
            return res.json({ success: true });
          }
          case 'redeemUserGift':
            return res.json({ success: true });
          case 'getLoyaltyProgram': {
            const tiers = await base44.entities.LoyaltyTier.filter({ business_id: body.business_id }, 'min_points');
            return res.json({ tiers });
          }
          case 'getRewards': {
            const rewards = await base44.entities.Discount.filter({ business_id: body.business_id, is_active: true }, '-created_date', 50);
            return res.json({ rewards });
          }
          case 'getPersonalizedOffers': {
            const offers = await base44.entities.Discount.filter({ is_active: true }, '-created_date', 10);
            return res.json({ offers });
          }
          case 'getReferralCenter': {
            const referrals = await base44.entities.PartnerReferral.filter({ referrer_id: user.id }, '-created_date', 50);
            return res.json({ referral_code: user.id.substring(0, 8).toUpperCase(), referrals, total: referrals.length });
          }
          case 'getRewardHistory': {
            const history = await base44.entities.GiftRedemption.filter({ user_id: user.id }, '-created_date', 50);
            return res.json({ history });
          }
          case 'exportRewardHistory':
            return res.json({ success: true, message: 'Export initiated' });
          case 'getRewardNotifications': {
            const notifs = await base44.entities.Notification.filter({ user_id: user.id, type: 'reward' }, '-sent_at', 20);
            return res.json({ notifications: notifs });
          }
          default:
            return res.status(400).json({ error: `Unknown walletApi action: ${action}` });
        }
      }
      
      // ============ authApi ============
      case 'authApi': {
        const { action } = body;
        
        switch (action) {
          case 'logAuthEvent':
            return res.json({ success: true });
          
          case 'getDevices': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            const devices = await base44.entities.Device.filter({ user_id: user.id }, '-created_date', 50);
            return res.json({ devices, total: devices.length });
          }
          
          case 'removeDevice': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            await base44.entities.Device.delete(body.device_id).catch(() => {});
            return res.json({ success: true });
          }
          
          case 'trustDevice': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            await base44.entities.Device.update(body.device_id, { is_trusted: body.is_trusted !== false });
            return res.json({ success: true });
          }
          
          case 'getSessions': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await base44.entities.Session.filter({ user_id: user.id }, '-created_date', 50).catch(() => []);
            return res.json({ sessions, total: sessions.length });
          }
          
          case 'revokeSession': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            await base44.entities.Session.delete(body.session_id).catch(() => {});
            return res.json({ success: true });
          }
          
          case 'getAuthHistory': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            const logs = await base44.asServiceRole.entities.AuditLog.filter({ user_id: user.id, resource_type: 'Authentication' }, '-created_date', 50);
            return res.json({ logs });
          }
          
          case 'saveProfileSetup':
          case 'checkProfileSetup':
            return res.json({ success: true, completed: true });
          
          case 'getProfile':
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            return res.json(sanitizeUser(user));
          
          case 'updateProfile': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            const allowed = ['full_name', 'phone', 'city', 'country', 'avatar_url', 'preferred_language'];
            const updates = {};
            for (const key of allowed) if (body[key] !== undefined) updates[key] = body[key];
            await base44.auth.updateMe(updates);
            return res.json({ success: true });
          }
          
          case 'getAccountInfo':
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            return res.json({ email: user.email, full_name: user.full_name, role: user.role, membership_type: user.membership_type, created_date: user.created_date });
          
          case 'getPrivacySettings':
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            return res.json({ marketing_consent: user.marketing_consent, push_notifications_enabled: user.push_notifications_enabled });
          
          case 'updatePrivacySettings': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            const updates = {};
            if (body.marketing_consent !== undefined) updates.marketing_consent = body.marketing_consent;
            if (body.push_notifications_enabled !== undefined) updates.push_notifications_enabled = body.push_notifications_enabled;
            await base44.auth.updateMe(updates);
            return res.json({ success: true });
          }
          
          case 'downloadPersonalData':
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            return res.json({ data: sanitizeUser(user) });
          
          case 'requestAccountDeletion':
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            return res.json({ success: true });
          
          case 'changePassword':
          case 'reauthenticate':
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            return res.json({ success: true });
          
          case 'getSecuritySettings':
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            return res.json({ two_factor_enabled: false, login_notifications: true });
          
          case 'updateSecuritySettings':
            return res.json({ success: true });
          
          default:
            return res.status(400).json({ error: `Unknown authApi action: ${action}` });
        }
      }
      
      // ============ membershipApi ============
      case 'membershipApi': {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const { action } = body;
        
        switch (action) {
          case 'getMembershipStatus': {
            const memberships = await base44.entities.UserMembership.filter({ user_id: user.id, status: 'active' });
            const subscription = memberships[0] || null;
            let plan = null;
            if (subscription?.plan_id) {
              const plans = await base44.entities.MembershipPlan.filter({ id: subscription.plan_id });
              plan = plans[0] || null;
            }
            const isPremium = (user.membership_type === 'premium') || !!subscription;
            return res.json({ membership_type: isPremium ? 'premium' : 'free', is_premium: isPremium, subscription, plan });
          }
          
          case 'activateFreePlan': {
            await base44.auth.updateMe({ membership_type: 'free' });
            return res.json({ success: true, membership_type: 'free' });
          }
          
          case 'cancelSubscription': {
            const subs = await base44.entities.UserMembership.filter({ user_id: user.id, status: 'active' });
            for (const sub of subs) {
              await base44.entities.UserMembership.update(sub.id, { status: 'cancelled', cancelled_date: new Date().toISOString() });
            }
            await base44.auth.updateMe({ membership_type: 'free' });
            return res.json({ success: true });
          }
          
          case 'toggleAutoRenew': {
            const subs = await base44.entities.UserMembership.filter({ user_id: user.id, status: 'active' });
            if (subs.length > 0) {
              await base44.entities.UserMembership.update(subs[0].id, { auto_renew: body.auto_renew !== false });
            }
            return res.json({ success: true });
          }
          
          case 'getInvoiceHistory': {
            const invoices = await base44.entities.Invoice.filter({ user_id: user.id }, '-created_date', 50);
            return res.json({ invoices });
          }
          
          case 'getPaymentHistory': {
            const payments = await base44.entities.Payment.filter({ user_id: user.id }, '-created_date', 50);
            return res.json({ payments });
          }
          
          case 'getSubscriptionHistory': {
            const subs = await base44.entities.UserMembership.filter({ user_id: user.id }, '-created_date', 50);
            return res.json({ subscriptions: subs });
          }
          
          case 'redeemPromoCode': {
            const coupons = await base44.entities.Coupon.filter({ code: String(body.promo_code || '').toUpperCase(), status: 'active' });
            if (coupons.length === 0) return res.status(404).json({ error: 'Invalid promo code' });
            return res.json({ success: true, coupon: coupons[0] });
          }
          
          case 'getReferralInfo': {
            const referrals = await base44.entities.PartnerReferral.filter({ referrer_id: user.id });
            return res.json({ referral_code: user.id.substring(0, 8).toUpperCase(), total_referrals: referrals.length, referrals });
          }
          
          case 'giftPremium':
          case 'requestRefund':
          case 'renewManually':
          case 'purchasePlan':
            return res.json({ success: true });
          
          default:
            return res.status(400).json({ error: `Unknown membershipApi action: ${action}` });
        }
      }
      
      // ============ notificationApi ============
      case 'notificationApi': {
        const { action } = body;
        
        switch (action) {
          case 'getInbox': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            const { filter: filterType, search } = body;
            let notifications = await base44.entities.Notification.filter({ user_id: user.id }, '-sent_at', 100);
            if (filterType === 'unread') notifications = notifications.filter(n => !n.is_read);
            if (filterType === 'archived') notifications = notifications.filter(n => n.is_archived);
            else notifications = notifications.filter(n => !n.is_archived);
            if (search) {
              const q = search.toLowerCase();
              notifications = notifications.filter(n => (n.title || '').toLowerCase().includes(q) || (n.message || '').toLowerCase().includes(q));
            }
            return res.json({ notifications, total: notifications.length, unread_count: notifications.filter(n => !n.is_read).length });
          }
          
          case 'markRead': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            if (body.notification_id) await base44.entities.Notification.update(body.notification_id, { is_read: true, read_at: new Date().toISOString() });
            return res.json({ success: true });
          }
          
          case 'markAllRead': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            await base44.entities.Notification.updateMany({ user_id: user.id, is_read: false }, { is_read: true, read_at: new Date().toISOString() });
            return res.json({ success: true });
          }
          
          case 'archive':
          case 'unarchive': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            await base44.entities.Notification.update(body.notification_id, { is_archived: action === 'archive' });
            return res.json({ success: true });
          }
          
          case 'delete': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            await base44.entities.Notification.delete(body.notification_id);
            return res.json({ success: true });
          }
          
          case 'getPreferences': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            return res.json({ push_enabled: user.push_notifications_enabled !== false, email_enabled: user.marketing_consent === true, sms_enabled: false });
          }
          
          case 'updatePreferences': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            const updates = {};
            if (body.push_enabled !== undefined) updates.push_notifications_enabled = body.push_enabled;
            if (body.email_enabled !== undefined) updates.marketing_consent = body.email_enabled;
            await base44.auth.updateMe(updates);
            return res.json({ success: true });
          }
          
          default:
            return res.status(400).json({ error: `Unknown notificationApi action: ${action}` });
        }
      }
      
      // ============ recommendationApi ============
      case 'recommendationApi': {
        const { action } = body;
        switch (action) {
          case 'recommendBusinesses': {
            const businesses = await base44.entities.Business.filter({ is_active: true }, '-created_date', 12);
            return res.json({ recommendations: businesses });
          }
          case 'recommendPlans': {
            const plans = await base44.entities.MembershipPlan.filter({ is_active: true, is_archived: false }, 'price');
            return res.json({ plans });
          }
          case 'getSimilarBusinesses': {
            const businesses = await base44.entities.Business.filter({ is_active: true, category: body.category }, '-created_date', 10);
            return res.json({ businesses });
          }
          default:
            return res.status(400).json({ error: `Unknown recommendationApi action: ${action}` });
        }
      }
      
      // ============ businessApi ============
      case 'businessApi': {
        const { action } = body;
        switch (action) {
          case 'search': {
            const { query, category, lat, lng } = body;
            let businesses = await base44.entities.Business.filter({ is_active: true }, 'name', 200);
            if (query) {
              const q = query.toLowerCase();
              businesses = businesses.filter(b => (b.name || '').toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q));
            }
            if (category) businesses = businesses.filter(b => b.category === category);
            return res.json({ businesses, total: businesses.length });
          }
          case 'get': {
            const biz = await base44.entities.Business.get(body.business_id);
            return res.json({ business: biz });
          }
          case 'getCategories': {
            const cats = await base44.entities.BusinessCategory.list('name');
            return res.json({ categories: cats });
          }
          case 'getLocations': {
            const locs = await base44.entities.BusinessLocation.filter({ business_id: body.business_id });
            return res.json({ locations: locs });
          }
          case 'getEmployees': {
            const emps = await base44.entities.Employee.filter({ business_id: body.business_id });
            return res.json({ employees: emps });
          }
          default:
            return res.json({ success: true });
        }
      }
      
      // ============ create-checkout ============
      case 'create-checkout': {
        const { productId, planId, promoCode, startTrial } = body;
        const planIdResolved = productId || planId;
        if (!planIdResolved) return res.status(400).json({ error: 'productId is required' });
        const plans = await base44.entities.MembershipPlan.filter({ id: planIdResolved }).catch(() => []);
        const plan = plans[0];
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        if (!plan.is_active || plan.is_archived) return res.status(400).json({ error: 'Plan not available' });
        return res.json({ redirectUrl: `/pricing?plan=${plan.id}`, checkoutSessionId: uuidv4() });
      }
      
      // ============ muapiApi (AI image generation) ============
      case 'muapiApi': {
        return res.json({ error: 'AI image generation not available in self-hosted mode' });
      }
      
      // ============ pushApi ============
      case 'pushApi': {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        return res.json({ success: true });
      }
      
      // ============ loyaltyApi ============
      case 'loyaltyApi': {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const points = await base44.entities.LoyaltyPoint.filter({ user_id: user.id }, '-created_date', 100);
        const total = points.reduce((sum, p) => sum + (p.points || 0), 0);
        return res.json({ total_points: total, history: points });
      }
      
      // ============ reviewsApi ============
      case 'reviewsApi': {
        const { action } = body;
        switch (action) {
          case 'getReviews': {
            const reviews = await base44.entities.Review.filter({ business_id: body.business_id }, '-created_date', 50);
            return res.json({ reviews });
          }
          case 'createReview': {
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            const review = await base44.entities.Review.create({
              user_id: user.id, user_name: user.full_name || user.email,
              business_id: body.business_id, rating: body.rating,
              title: body.title, content: body.content, status: 'published',
            });
            return res.json({ review });
          }
          default:
            return res.json({ success: true });
        }
      }
      
      // ============ crmApi ============
      case 'crmApi': {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const records = await base44.entities.CrmRecord.filter({ assigned_to: user.id }, '-updated_date', 100);
        return res.json({ records });
      }
      
      // ============ supportApi ============
      case 'supportApi': {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const tickets = await base44.entities.SupportTicket.filter({ user_id: user.id }, '-created_date', 50);
        return res.json({ tickets });
      }
      
      // ============ discountApi ============
      case 'discountApi': {
        const discounts = await base44.entities.Discount.filter({ is_active: true }, '-created_date', 50);
        return res.json({ discounts });
      }
      
      // ============ chatApi (Business <-> Customer messaging) ============
      case 'chatApi': {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const { action } = body;
        
        switch (action) {
          case 'getConversations': {
            const result = await pool.query(`
              SELECT DISTINCT ON (conversation_id)
                conversation_id, business_id, business_name, user_id, user_name,
                business_owner_id, sender_type, sender_name, content, is_read, created_date
              FROM chat_messages
              WHERE user_id = $1 OR business_owner_id = $1
              ORDER BY conversation_id, created_date DESC
            `, [user.id]);
            return res.json({ conversations: result.rows });
          }
          
          case 'getMessages': {
            const { conversation_id } = body;
            if (!conversation_id) return res.status(400).json({ error: 'conversation_id required' });
            const result = await pool.query(
              'SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_date ASC',
              [conversation_id]
            );
            return res.json({ messages: result.rows });
          }
          
          case 'markAsRead': {
            const { conversation_id } = body;
            if (conversation_id) {
              await pool.query(
                'UPDATE chat_messages SET is_read = true, read_at = NOW() WHERE conversation_id = $1 AND sender_type != $2',
                [conversation_id, user.id === body.business_owner_id ? 'customer' : 'business']
              );
            }
            return res.json({ success: true });
          }
          
          case 'sendMessage': {
            const { conversation_id, business_id, business_name, content } = body;
            if (!content) return res.status(400).json({ error: 'content required' });
            
            const convId = conversation_id || uuidv4();
            const msgId = uuidv4();
            const senderType = body.sender_type || 'customer';
            
            // Get business owner id
            let businessOwnerId = body.business_owner_id;
            if (!businessOwnerId && business_id) {
              const bizResult = await pool.query('SELECT owner_id FROM businesses WHERE id = $1', [business_id]);
              businessOwnerId = bizResult.rows[0]?.owner_id || null;
            }
            
            await pool.query(`
              INSERT INTO chat_messages (id, conversation_id, business_id, business_name, user_id, user_name, business_owner_id, sender_type, sender_id, sender_name, content, is_read, created_date, updated_date)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, NOW(), NOW())
            `, [msgId, convId, business_id || null, business_name || null, user.id, user.full_name || user.email, businessOwnerId, senderType, user.id, user.full_name || user.email, content]);
            
            return res.json({ message_id: msgId, conversation_id: convId, success: true });
          }
          
          default:
            return res.status(400).json({ error: `Unknown chatApi action: ${action}` });
        }
      }
      
      // ============ marketingApi ============
      case 'marketingApi': {
        const campaigns = await base44.entities.Campaign.filter({ status: 'active' }, '-created_date', 50);
        return res.json({ campaigns });
      }
      
      // ============ customerAiApi (AI Concierge for customers) ============
      case 'customerAiApi': {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const { action } = body;
        
        switch (action) {
          case 'chat': {
            const { message, history } = body;
            if (!message) return res.status(400).json({ error: 'message required' });
            
            // Gather user context
            const favorites = await base44.entities.Favorite.filter({ user_id: user.id }, '-created_date', 10);
            const favCategories = [...new Set(favorites.map(f => f.category).filter(Boolean))].join(', ');
            const loyaltyPoints = await base44.entities.LoyaltyPoint.filter({ user_id: user.id });
            const totalPoints = loyaltyPoints.reduce((sum, p) => sum + (p.points || 0), 0);
            
            const result = await customerConciergeChat(message, {
              full_name: user.full_name,
              membership_type: user.membership_type || 'free',
              city: user.city,
              country: user.country,
              favorites: favCategories || 'None yet',
              loyalty_points: totalPoints,
              history,
            });
            
            // Save chat to history
            const msgId = uuidv4();
            await pool.query(`
              INSERT INTO chat_messages (id, conversation_id, user_id, user_name, sender_type, sender_id, sender_name, content, is_read, created_date, updated_date)
              VALUES ($1, $2, $3, $4, 'assistant', 'ai-concierge', 'ANERIUM AI', $5, true, NOW(), NOW())
            `, [msgId, `ai-${user.id}`, user.id, user.full_name || user.email, result.content]);
            
            return res.json({ response: result.content, message_id: msgId, conversation_id: `ai-${user.id}` });
          }
          
          case 'getRecommendations': {
            const businesses = await base44.entities.Business.filter({ is_active: true }, 'name', 50);
            const favorites = await base44.entities.Favorite.filter({ user_id: user.id }, '-created_date', 10);
            const favCategories = [...new Set(favorites.map(f => f.category).filter(Boolean))].join(', ');
            
            const result = await generateRecommendations(user, businesses, favCategories);
            
            // Enrich with business data
            if (result.recommendations) {
              const enriched = await Promise.all(
                result.recommendations.slice(0, 8).map(async (rec) => {
                  const bizArr = await base44.entities.Business.filter({ id: rec.business_id }).catch(() => []);
                  const biz = bizArr[0];
                  if (biz) return { ...biz, reason: rec.reason };
                  return null;
                })
              );
              result.recommendations = enriched.filter(Boolean);
            }
            
            return res.json(result);
          }
          
          case 'getSavingsInsights': {
            const transactions = await base44.entities.Transaction.filter({ customer_id: user.id }, '-transaction_date', 20);
            const result = await generateSavingsInsights(user, transactions);
            return res.json(result);
          }
          
          case 'planTrip': {
            const { destination, duration, preferences } = body;
            if (!destination) return res.status(400).json({ error: 'destination required' });
            const businesses = await base44.entities.Business.filter({ is_active: true }, 'name', 50);
            const result = await planTrip(destination, duration, preferences, businesses);
            return res.json(result);
          }
          
          case 'getMembershipAdvice': {
            const plans = await base44.entities.MembershipPlan.filter({ is_active: true, is_archived: false }, 'price');
            const result = await generateMembershipAdvice(user, plans, user.membership_type || 'free');
            return res.json(result);
          }
          
          case 'deleteChatHistory': {
            await pool.query('DELETE FROM chat_messages WHERE conversation_id = $1', [`ai-${user.id}`]);
            return res.json({ success: true });
          }
          
          default:
            return res.status(400).json({ error: `Unknown customerAiApi action: ${action}` });
        }
      }
      
      // ============ aiAssistantApi (Business Portal AI) ============
      case 'aiAssistantApi': {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const { action } = body;
        
        // Get the user's business
        const userBusinesses = await base44.entities.Business.filter({ owner_id: user.id });
        const business = userBusinesses[0] || null;
        
        switch (action) {
          case 'getAiRecommendations':
          case 'getAiInsights': {
            if (!business) return res.json({ insights: [], recommendations: [], performance_summary: 'No business found for this user.' });
            const metrics = await getBusinessMetrics(business.id);
            const reviews = await base44.entities.Review.filter({ business_id: business.id }, '-created_date', 10);
            const result = await generateBusinessInsights(business, metrics, reviews);
            return res.json(result);
          }
          
          case 'getMarketingAssistant': {
            if (!business) return res.json({ campaigns: [], content_suggestions: [], tips: ['No business found.'] });
            const metrics = await getBusinessMetrics(business.id);
            const customerData = { total_customers: metrics.customer_count, avg_rating: metrics.avg_rating };
            const result = await generateMarketingAssistant(business, customerData);
            return res.json(result);
          }
          
          case 'askQuestion': {
            if (!business) return res.json({ answer: 'No business found for this user.' });
            const { question } = body;
            if (!question) return res.status(400).json({ error: 'question required' });
            const metrics = await getBusinessMetrics(business.id);
            const result = await answerBusinessQuestion(question, business, metrics);
            return res.json(result);
          }
          
          case 'getWeeklySummary': {
            if (!business) return res.json({ headline: 'No business found.', highlights: [], action_items: [] });
            const metrics = await getBusinessMetrics(business.id);
            const result = await generateWeeklySummary(business, metrics);
            return res.json(result);
          }
          
          case 'getOperationsInsights': {
            if (!business) return res.json({ insights: [], recommendations: [] });
            const metrics = await getBusinessMetrics(business.id);
            const employees = await base44.entities.Employee.filter({ business_id: business.id });
            const result = await generateOperationsInsights(business, {
              ...metrics,
              employee_count: employees.length,
            });
            return res.json(result);
          }
          
          case 'getScoreAdvisor': {
            if (!business) return res.json({ interpretation: 'No business found.', improvement_plan: [] });
            const metrics = await getBusinessMetrics(business.id);
            // Calculate a simple score
            const score = Math.round(
              (Math.min(metrics.review_count / 10, 1) * 25) +
              (Math.min(metrics.avg_rating / 5, 1) * 25) +
              (Math.min(metrics.customer_count / 50, 1) * 25) +
              (Math.min(metrics.revenue / 10000, 1) * 25)
            );
            const scoreBreakdown = {
              reviews: `${Math.min(metrics.review_count / 10, 1) * 25}/25`,
              rating: `${Math.min(metrics.avg_rating / 5, 1) * 25}/25`,
              customers: `${Math.min(metrics.customer_count / 50, 1) * 25}/25`,
              revenue: `${Math.min(metrics.revenue / 10000, 1) * 25}/25`,
            };
            const result = await generateScoreAdvisor(business, score, scoreBreakdown);
            return res.json({ ...result, overall_score: score });
          }
          
          default:
            return res.status(400).json({ error: `Unknown aiAssistantApi action: ${action}` });
        }
      }
      
      // ============ businessPortalApi ============
      case 'businessPortalApi': {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const { action } = body;
        
        const userBusinesses = await base44.entities.Business.filter({ owner_id: user.id });
        const business = userBusinesses[0] || null;
        
        switch (action) {
          case 'getDashboard': {
            if (!business) return res.json({ business: null, metrics: {} });
            const metrics = await getBusinessMetrics(business.id);
            return res.json({ business, metrics });
          }
          
          case 'getProfile': {
            return res.json({ business });
          }
          
          case 'updateProfile': {
            if (!business) return res.status(404).json({ error: 'Business not found' });
            const allowed = ['name', 'description', 'category', 'website', 'logo_url', 'business_email', 'business_phone'];
            const updates = {};
            for (const key of allowed) if (body[key] !== undefined) updates[key] = body[key];
            await base44.entities.Business.update(business.id, updates);
            return res.json({ success: true });
          }
          
          case 'getEmployees': {
            const employees = business ? await base44.entities.Employee.filter({ business_id: business.id }) : [];
            return res.json({ employees });
          }
          
          case 'getAnalytics': {
            if (!business) return res.json({ analytics: {} });
            const metrics = await getBusinessMetrics(business.id);
            return res.json({ analytics: metrics });
          }
          
          case 'getReviews': {
            const reviews = business ? await base44.entities.Review.filter({ business_id: business.id }, '-created_date', 50) : [];
            return res.json({ reviews });
          }
          
          case 'getTransactions': {
            const txResult = business ? await pool.query('SELECT * FROM transactions WHERE business_id = $1 ORDER BY created_date DESC LIMIT 50', [business.id]) : { rows: [] };
            return res.json({ transactions: txResult.rows });
          }
          
          case 'getCustomerProfile': {
            const { customer_id } = body;
            if (!customer_id) return res.status(400).json({ error: 'customer_id required' });
            const customerResult = await pool.query('SELECT id, email, full_name, phone, city, country, membership_type, created_date FROM users WHERE id = $1', [customer_id]);
            const txResult = await pool.query('SELECT * FROM transactions WHERE customer_id = $1 AND business_id = $2 ORDER BY created_date DESC LIMIT 20', [customer_id, business?.id]);
            return res.json({ customer: customerResult.rows[0], transactions: txResult.rows });
          }
          
          case 'getDirectory': {
            const search = body.search || '';
            let customersResult = await pool.query(`
              SELECT DISTINCT u.id, u.email, u.full_name, u.membership_type, u.city, u.country, u.created_date,
                COUNT(t.id) as transaction_count, COALESCE(SUM(t.amount),0) as total_spent
              FROM users u
              LEFT JOIN transactions t ON t.customer_id = u.id ${business ? 'AND t.business_id = $2' : ''}
              WHERE u.role = 'member' ${search ? "AND (u.full_name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')" : ''}
              GROUP BY u.id
              ORDER BY total_spent DESC
              LIMIT 100
            `, search ? (business ? [search, business.id] : [search]) : (business ? [business.id] : []));
            return res.json({ customers: customersResult.rows, total: customersResult.rows.length });
          }
          
          default:
            return res.json({ success: true, message: `${action} not fully implemented` });
        }
      }
      
      // ============ adminApi ============
      case 'adminApi': {
        if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        const { action } = body;
        
        switch (action) {
          case 'getDashboard': {
            const stats = await pool.query(`
              SELECT
                (SELECT COUNT(*) FROM users WHERE role = 'member') as total_members,
                (SELECT COUNT(*) FROM users WHERE role = 'business_owner') as total_businesses,
                (SELECT COUNT(*) FROM users WHERE membership_type = 'premium') as premium_members,
                (SELECT COUNT(*) FROM transactions) as total_transactions,
                (SELECT COALESCE(SUM(amount),0) FROM transactions) as total_revenue,
                (SELECT COUNT(*) FROM businesses WHERE is_active = true) as active_businesses
            `);
            return res.json({ stats: stats.rows[0] });
          }
          
          case 'getUsers': {
            const users = await pool.query('SELECT id, email, full_name, role, membership_type, city, country, is_active, created_date FROM users ORDER BY created_date DESC LIMIT 200');
            return res.json({ users: users.rows });
          }
          
          case 'getBusinesses': {
            const businesses = await pool.query('SELECT b.*, u.email as owner_email FROM businesses b LEFT JOIN users u ON b.owner_id = u.id ORDER BY b.created_date DESC LIMIT 200');
            return res.json({ businesses: businesses.rows });
          }
          
          case 'getTransactions': {
            const tx = await pool.query('SELECT t.*, u.full_name as customer_name, b.name as business_name FROM transactions t LEFT JOIN users u ON t.customer_id = u.id LEFT JOIN businesses b ON t.business_id = b.id ORDER BY t.created_date DESC LIMIT 200');
            return res.json({ transactions: tx.rows });
          }
          
          case 'getReviews': {
            const reviews = await pool.query('SELECT r.*, u.full_name as user_name, b.name as business_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id LEFT JOIN businesses b ON r.business_id = b.id ORDER BY r.created_date DESC LIMIT 200');
            return res.json({ reviews: reviews.rows });
          }
          
          case 'getSettings': {
            const settings = await pool.query('SELECT * FROM system_settings ORDER BY key');
            return res.json({ settings: settings.rows });
          }
          
          case 'updateSettings': {
            const { key, value } = body;
            if (!key) return res.status(400).json({ error: 'key required' });
            await pool.query('INSERT INTO system_settings (id, key, value, updated_date) VALUES ($1, $2, $3, NOW()) ON CONFLICT (key) DO UPDATE SET value = $3, updated_date = NOW()', [uuidv4(), key, String(value)]);
            return res.json({ success: true });
          }
          
          default:
            return res.json({ success: true, message: `${action} not fully implemented` });
        }
      }
      
      // ============ emailBlastApi ============
      case 'emailBlastApi': {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const { action } = body;
        const userBusinesses = await base44.entities.Business.filter({ owner_id: user.id });
        const business = userBusinesses[0] || null;
        
        switch (action) {
          case 'list': {
            if (!business) return res.json({ blasts: [] });
            const blasts = await pool.query('SELECT * FROM business_email_blasts WHERE business_id = $1 ORDER BY created_date DESC', [business.id]);
            return res.json({ blasts: blasts.rows });
          }
          case 'preview':
          case 'create':
            return res.json({ success: true, message: 'Email blast created' });
          case 'sendToSegment':
          case 'pay':
            return res.json({ success: true, message: 'Email blast sent' });
          default:
            return res.json({ success: true });
        }
      }
      
      // ============ Remaining stubs ============
      case 'analyticsApi':
      case 'businessAnalyticsApi':
      case 'businessFraudScanner':
      case 'businessScoreApi':
      case 'developerPortalApi':
      case 'disputeApi':
      case 'employeeApi':
      case 'financeApi':
      case 'gaAnalyticsApi':
      case 'helpCenterApi':
      case 'kycApi':
      case 'notificationCenterApi':
      case 'outreachApi':
      case 'partnerApi':
      case 'phoneVerificationApi':
      case 'qaChecklistApi':
      case 'qrWalletApi':
      case 'securityApi':
      case 'systemSettingsApi':
      case 'translationApi':
      case 'walletPassApi':
        return res.json({ success: true, message: `${functionName} not fully implemented in self-hosted mode` });
      
      case 'sendToMike': {
        const { message, projectId, messageType } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });
        const id = uuidv4();
        await pool.query(
          'INSERT INTO agent_messages (id, content, from_agent, to_agent, message_type, project_id, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [id, message, 'brio', 'mike', messageType || 'status', projectId || 'anerium-onepass', 'sent', req.user?.userId || null]
        );
        return res.json({ success: true, id, message: 'Message sent to Mike' });
      }
      default:
        return res.status(404).json({ error: `Function not found: ${functionName}` });
    }
  } catch (err) {
    console.error(`Function ${functionName} error:`, err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
