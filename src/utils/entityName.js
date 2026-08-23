/**
 * Converts a Base44 entity PascalCase name to its snake_case pluralized
 * PostgreSQL table name. This MUST match the mapping in schema-full.sql.
 */

/**
 * Convert a camelCase/PascalCase string to snake_case.
 * Handles leading uppercase correctly (no leading underscore).
 */
export function toSnakeCase(str) {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

const IRREGULAR = {
  User: 'users',
  Business: 'businesses',
  BusinessCategory: 'business_categories',
  Policy: 'policies',
  Category: 'categories',
  LoyaltyPoints: 'loyalty_points',
  LoyaltyTier: 'loyalty_tiers',
  DeviceToken: 'devices',
  Notification: 'notifications',
  Favorite: 'favorites',
  Transaction: 'transactions',
  Review: 'reviews',
  QrCode: 'qr_codes',
  Subscription: 'subscriptions',
  UserMembership: 'user_memberships',
  MembershipPlan: 'membership_plans',
  Coupon: 'coupons',
  Discount: 'discounts',
  Session: 'sessions',
  Employee: 'employees',
  Booking: 'bookings',
  ChatMessage: 'chat_messages',
  SupportTicket: 'support_tickets',
  Campaign: 'campaigns',
  BusinessLocation: 'business_locations',
  BusinessDocument: 'business_documents',
  Membership: 'user_memberships',
  Gift: 'gift_campaigns',
  Saving: 'savings',
  Leaderboard: 'leaderboards',
  Referral: 'partner_referrals',
  CampaignAudience: 'campaign_audiences',
  CampaignMessage: 'campaign_messages',
  ReviewReply: 'review_replies',
  TicketMessage: 'ticket_messages',
  NotificationTemplate: 'notification_templates',
  OutreachCampaign: 'outreach_campaigns',
  PartnerReferral: 'partner_referrals',
  BusinessEmailBlast: 'business_email_blasts',
  CommissionPayment: 'commission_payments',
  ComplianceRequest: 'compliance_requests',
  ConfigChangeLog: 'config_change_logs',
  DeveloperApp: 'developer_apps',
  EmployeeSchedule: 'employee_schedules',
  FeatureFlag: 'feature_flags',
  GiftCampaign: 'gift_campaigns',
  GiftRedemption: 'gift_redemptions',
  KnowledgeBase: 'knowledge_bases',
  NewsletterSubscriber: 'newsletter_subscribers',
  OtpCode: 'otp_codes',
  PaymentMethod: 'payment_methods',
  ScheduledReport: 'scheduled_reports',
  SecurityIncident: 'security_incidents',
  SlaConfig: 'sla_configs',
  SystemSetting: 'system_settings',
  TaxConfig: 'tax_configs',
  WebhookConfig: 'webhook_configs',
  WebhookLog: 'webhook_logs',
  AuditLog: 'audit_logs',
  AgentMessage: 'agent_messages',
  Base44Purchase: 'base44_purchases',
  SavedSegment: 'saved_segments',
  CrmRecord: 'crm_records',
  Dispute: 'disputes',
  Invoice: 'invoices',
  Role: 'roles',
  Permission: 'permissions',
  Device: 'devices',
};

function pluralize(snake) {
  if (snake.endsWith('y') && !/[aeiou]y$/.test(snake)) return snake.slice(0, -1) + 'ies';
  if (snake.endsWith('s') || snake.endsWith('x') || snake.endsWith('ch') || snake.endsWith('sh')) return snake + 'es';
  return snake + 's';
}

export function entityNameToTableName(entityName) {
  if (IRREGULAR[entityName]) return IRREGULAR[entityName];
  // If already lowercase (snake_case), assume it's already a table name from the SDK
  if (entityName === entityName.toLowerCase() && !/[A-Z]/.test(entityName)) {
    return entityName;
  }
  return pluralize(toSnakeCase(entityName));
}

/**
 * Convert a snake_case DB column back to camelCase for API responses.
 */
export function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Get the list of columns for a table from the database.
 */
const columnCache = new Map();
export async function getTableColumns(pool, tableName) {
  if (columnCache.has(tableName)) return columnCache.get(tableName);
  const result = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = $1 AND table_schema = 'public'
    ORDER BY ordinal_position
  `, [tableName]);
  const cols = result.rows.map(r => r.column_name);
  columnCache.set(tableName, cols);
  return cols;
}

/**
 * Transform a DB row (snake_case) to API response (camelCase keys).
 */
export function transformRow(row) {
  if (!row) return null;
  const out = {};
  for (const [key, val] of Object.entries(row)) {
    const ccKey = toCamelCase(key);
    if (val instanceof Date) {
      out[ccKey] = val.toISOString();
    } else {
      out[ccKey] = val;
    }
  }
  return out;
}

/**
 * Transform API data (camelCase) to DB columns (snake_case).
 */
export function transformToDb(data, columns) {
  const out = {};
  for (const [key, val] of Object.entries(data)) {
    const snake = toSnakeCase(key);
    if (columns.includes(snake)) {
      if (val !== null && val !== undefined && typeof val === 'object') {
        out[snake] = JSON.stringify(val);
      } else {
        out[snake] = val;
      }
    }
  }
  return out;
}
