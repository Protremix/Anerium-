-- ============================================================
-- Generated PostgreSQL Schema from Base44 JSONC Entity Schemas
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Entity: AuditLog -> Table: audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  user_name TEXT,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT,
  metadata TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Base44Purchase -> Table: base44_purchases
-- ============================================================
CREATE TABLE IF NOT EXISTS base44_purchases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  checkoutSessionId TEXT,
  status TEXT,
  user_id TEXT,
  user_name TEXT,
  plan_id TEXT,
  plan_name TEXT,
  expected_amount NUMERIC,
  expected_currency TEXT,
  entitlement TEXT,
  is_trial BOOLEAN,
  promo_code TEXT,
  fulfilled BOOLEAN,
  payment_id TEXT,
  subscription_id TEXT,
  paid_at TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: BlogPost -> Table: blog_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  author_name TEXT,
  author_id TEXT,
  featured_image_url TEXT,
  status TEXT,
  published_date TIMESTAMPTZ,
  tags TEXT,
  read_time TEXT,
  is_featured BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Booking -> Table: bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT,
  business_name TEXT,
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  booking_type TEXT,
  booking_date TIMESTAMPTZ,
  booking_time TEXT,
  party_size NUMERIC,
  notes TEXT,
  status TEXT,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Business -> Table: businesses
-- ============================================================
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  legal_name TEXT,
  description TEXT,
  category TEXT,
  subcategories TEXT,
  year_founded NUMERIC,
  business_category_id TEXT,
  discount_percentage NUMERIC,
  logo_url TEXT,
  cover_image_url TEXT,
  featured_image_url TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  service_area TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  social_links TEXT,
  primary_contact_name TEXT,
  primary_contact_role TEXT,
  primary_contact_phone TEXT,
  primary_contact_email TEXT,
  business_hours TEXT,
  holiday_hours TEXT,
  media_gallery TEXT,
  verification_status TEXT,
  vat_number TEXT,
  vat_number_valid BOOLEAN,
  company_registration_number TEXT,
  registration_country TEXT,
  kyc_submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verifier_admin_id TEXT,
  rejection_reason TEXT,
  is_active BOOLEAN,
  is_featured BOOLEAN,
  average_rating NUMERIC,
  total_reviews NUMERIC,
  business_score NUMERIC,
  tags TEXT,
  tax_id TEXT,
  parent_business_id TEXT,
  seo_slug TEXT,
  supported_languages TEXT,
  amenities TEXT,
  payment_methods TEXT,
  visibility TEXT,
  customer_messaging_enabled BOOLEAN,
  booking_enabled BOOLEAN,
  booking_url TEXT,
  booking_config TEXT,
  notification_prefs TEXT,
  profile_completion NUMERIC,
  profile_published BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: BusinessCategory -> Table: business_categories
-- ============================================================
CREATE TABLE IF NOT EXISTS business_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  description TEXT,
  icon TEXT,
  slug TEXT,
  parent_id TEXT,
  sort_order NUMERIC,
  is_active BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: BusinessDocument -> Table: business_documents
-- ============================================================
CREATE TABLE IF NOT EXISTS business_documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  business_id TEXT,
  business_name TEXT,
  document_type TEXT,
  file_url TEXT,
  file_name TEXT,
  status TEXT,
  expiry_date TIMESTAMPTZ,
  uploaded_by_id TEXT,
  uploaded_by_name TEXT,
  verified_by_id TEXT,
  verified_date TIMESTAMPTZ,
  rejection_reason TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: BusinessEmailBlast -> Table: business_email_blasts
-- ============================================================
CREATE TABLE IF NOT EXISTS business_email_blasts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT,
  business_name TEXT,
  business_category TEXT,
  scope TEXT,
  target_country TEXT,
  target_city TEXT,
  target_area TEXT,
  subject TEXT,
  body TEXT,
  audience_count NUMERIC,
  price NUMERIC,
  currency TEXT,
  status TEXT,
  checkout_session_id TEXT,
  payment_id TEXT,
  review_notes TEXT,
  reviewed_by_id TEXT,
  reviewed_at TIMESTAMPTZ,
  sent_count NUMERIC,
  failed_count NUMERIC,
  error_message TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: BusinessLocation -> Table: business_locations
-- ============================================================
CREATE TABLE IF NOT EXISTS business_locations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  business_id TEXT,
  business_name TEXT,
  name TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  phone TEXT,
  email TEXT,
  business_hours TEXT,
  is_primary BOOLEAN,
  is_active BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Campaign -> Table: campaigns
-- ============================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT,
  business_name TEXT,
  title TEXT,
  description TEXT,
  type TEXT,
  status TEXT,
  channels TEXT,
  message_subject TEXT,
  message_body TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  target_audience TEXT,
  target_city TEXT,
  audience_filters TEXT,
  total_recipients NUMERIC,
  delivered_count NUMERIC,
  opened_count NUMERIC,
  clicked_count NUMERIC,
  conversion_count NUMERIC,
  coupon_id TEXT,
  gift_campaign_id TEXT,
  image_url TEXT,
  opt_in_only BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: CampaignAudience -> Table: campaign_audiences
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_audiences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  campaign_id TEXT,
  campaign_title TEXT,
  user_id TEXT,
  user_name TEXT,
  status TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: CampaignMessage -> Table: campaign_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  campaign_id TEXT,
  campaign_title TEXT,
  channel TEXT,
  subject TEXT,
  body TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT,
  recipient_count NUMERIC,
  open_count NUMERIC,
  click_count NUMERIC,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: ChatMessage -> Table: chat_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT,
  business_id TEXT,
  business_name TEXT,
  user_id TEXT,
  user_name TEXT,
  business_owner_id TEXT,
  sender_type TEXT,
  sender_id TEXT,
  sender_name TEXT,
  content TEXT,
  is_read BOOLEAN,
  read_at TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: CommissionPayment -> Table: commission_payments
-- ============================================================
CREATE TABLE IF NOT EXISTS commission_payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  partner_id TEXT,
  partner_name TEXT,
  partner_email TEXT,
  period TEXT,
  gross_amount NUMERIC,
  commission_rate NUMERIC,
  net_amount NUMERIC,
  currency TEXT,
  status TEXT,
  payment_method TEXT,
  payment_date TIMESTAMPTZ,
  transaction_reference TEXT,
  referral_count NUMERIC,
  breakdown TEXT,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: ComplianceRequest -> Table: compliance_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS compliance_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  request_type TEXT,
  status TEXT,
  description TEXT,
  consent_type TEXT,
  consent_value BOOLEAN,
  processed_by_id TEXT,
  processed_by_name TEXT,
  processed_at TIMESTAMPTZ,
  export_url TEXT,
  deletion_scheduled_at TIMESTAMPTZ,
  retention_category TEXT,
  retention_days NUMERIC,
  resolution_notes TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: ConfigChangeLog -> Table: config_change_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS config_change_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  entity_type TEXT,
  entity_id TEXT,
  entity_key TEXT,
  action TEXT,
  previous_value TEXT,
  new_value TEXT,
  changed_by_id TEXT,
  changed_by_name TEXT,
  change_reason TEXT,
  is_critical BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Coupon -> Table: coupons
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT,
  business_name TEXT,
  code TEXT,
  title TEXT,
  description TEXT,
  discount_percentage NUMERIC,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  usage_limit NUMERIC,
  used_count NUMERIC,
  status TEXT,
  premium_only BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: CrmRecord -> Table: crm_records
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  business_id TEXT,
  business_name TEXT,
  user_id TEXT,
  customer_name TEXT,
  vip_flag BOOLEAN,
  tags TEXT,
  lifecycle_status TEXT,
  marketing_consent BOOLEAN,
  internal_notes TEXT,
  follow_up_tasks TEXT,
  custom_fields TEXT,
  preferred_contact_method TEXT,
  last_contacted_date TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: DeveloperApp -> Table: developer_apps
-- ============================================================
CREATE TABLE IF NOT EXISTS developer_apps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  description TEXT,
  app_type TEXT,
  status TEXT,
  scopes TEXT,
  redirect_uri TEXT,
  api_key TEXT,
  api_secret_hash TEXT,
  webhook_url TEXT,
  webhook_secret TEXT,
  webhook_events TEXT,
  rate_limit_per_min NUMERIC,
  ip_whitelist TEXT,
  total_requests NUMERIC,
  requests_today NUMERIC,
  last_request_at TIMESTAMPTZ,
  owner_name TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Device -> Table: devices
-- ============================================================
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  user_id TEXT,
  device_type TEXT,
  device_id TEXT,
  device_name TEXT,
  os_version TEXT,
  app_version TEXT,
  push_token TEXT,
  last_seen TIMESTAMPTZ,
  ip_address TEXT,
  is_active BOOLEAN,
  is_trusted BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Discount -> Table: discounts
-- ============================================================
CREATE TABLE IF NOT EXISTS discounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT,
  business_name TEXT,
  title TEXT,
  description TEXT,
  percentage NUMERIC,
  category TEXT,
  tags TEXT,
  image_url TEXT,
  min_purchase_amount NUMERIC,
  max_discount_amount NUMERIC,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  usage_limit NUMERIC,
  used_count NUMERIC,
  is_active BOOLEAN,
  premium_only BOOLEAN,
  is_featured BOOLEAN,
  is_limited_time BOOLEAN,
  terms_conditions TEXT,
  eligible_branch_ids TEXT,
  redemption_requirements TEXT,
  view_count NUMERIC,
  sort_order NUMERIC,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Dispute -> Table: disputes
-- ============================================================
CREATE TABLE IF NOT EXISTS disputes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  user_name TEXT,
  business_id TEXT,
  business_name TEXT,
  business_owner_id TEXT,
  transaction_id TEXT,
  qr_code_id TEXT,
  reason TEXT,
  description TEXT,
  evidence_urls TEXT,
  status TEXT,
  business_response TEXT,
  business_responded_at TIMESTAMPTZ,
  resolution_notes TEXT,
  refund_amount NUMERIC,
  refund_issued BOOLEAN,
  sla_due_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by_id TEXT,
  timeline TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Employee -> Table: employees
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  business_id TEXT,
  business_name TEXT,
  user_id TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  permissions TEXT,
  is_active BOOLEAN,
  hired_date TIMESTAMPTZ,
  branch_id TEXT,
  branch_name TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: EmployeeSchedule -> Table: employee_schedules
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_schedules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  employee_id TEXT,
  employee_name TEXT,
  business_id TEXT,
  business_name TEXT,
  branch_id TEXT,
  branch_name TEXT,
  weekday TEXT,
  start_time TEXT,
  end_time TEXT,
  break_minutes NUMERIC,
  is_recurring BOOLEAN,
  specific_date TIMESTAMPTZ,
  clock_in_time TIMESTAMPTZ,
  clock_out_time TIMESTAMPTZ,
  status TEXT,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Favorite -> Table: favorites
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  user_id TEXT,
  user_name TEXT,
  business_id TEXT,
  business_name TEXT,
  category TEXT,
  discount_id TEXT,
  discount_title TEXT,
  collection_name TEXT,
  notify_on_change BOOLEAN,
  is_watched BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: FeatureFlag -> Table: feature_flags
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  description TEXT,
  key TEXT,
  is_enabled BOOLEAN,
  rollout_strategy TEXT,
  target_countries TEXT,
  target_user_groups TEXT,
  rollout_percentage NUMERIC,
  scheduled_activation_at TIMESTAMPTZ,
  scheduled_deactivation_at TIMESTAMPTZ,
  created_by_id TEXT,
  created_by_name TEXT,
  updated_by_id TEXT,
  updated_by_name TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: GiftCampaign -> Table: gift_campaigns
-- ============================================================
CREATE TABLE IF NOT EXISTS gift_campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT,
  business_name TEXT,
  title TEXT,
  description TEXT,
  gift_type TEXT,
  value NUMERIC,
  value_unit TEXT,
  trigger_type TEXT,
  audience_type TEXT,
  target_user_ids TEXT,
  segment_rules TEXT,
  milestone_metric TEXT,
  milestone_threshold NUMERIC,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  expiry_days NUMERIC,
  total_quantity NUMERIC,
  claimed_quantity NUMERIC,
  redeemed_quantity NUMERIC,
  per_customer_limit NUMERIC,
  points_reward NUMERIC,
  status TEXT,
  image_url TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_count NUMERIC,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: GiftRedemption -> Table: gift_redemptions
-- ============================================================
CREATE TABLE IF NOT EXISTS gift_redemptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  gift_campaign_id TEXT,
  gift_campaign_title TEXT,
  user_id TEXT,
  user_name TEXT,
  business_id TEXT,
  business_name TEXT,
  awarded_date TIMESTAMPTZ,
  redeemed_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  status TEXT,
  redemption_code TEXT,
  gift_type_snapshot TEXT,
  gift_value_snapshot NUMERIC,
  gift_value_unit_snapshot TEXT,
  source TEXT,
  points_awarded NUMERIC,
  transaction_id TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Invoice -> Table: invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  user_name TEXT,
  business_id TEXT,
  business_name TEXT,
  payment_id TEXT,
  subscription_id TEXT,
  invoice_number TEXT,
  amount NUMERIC,
  currency TEXT,
  tax_rate NUMERIC,
  tax_amount NUMERIC,
  total_amount NUMERIC,
  billing_period TEXT,
  status TEXT,
  issue_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,
  pdf_url TEXT,
  line_items TEXT,
  refund_amount NUMERIC,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: KnowledgeBase -> Table: knowledge_bases
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT,
  content TEXT,
  summary TEXT,
  category TEXT,
  subcategory TEXT,
  article_type TEXT,
  tags TEXT,
  is_published BOOLEAN,
  is_featured BOOLEAN,
  status TEXT,
  language TEXT,
  video_url TEXT,
  screenshots TEXT,
  sort_order NUMERIC,
  version NUMERIC,
  approved_by_id TEXT,
  approved_by_name TEXT,
  approved_at TIMESTAMPTZ,
  translation_key TEXT,
  view_count NUMERIC,
  helpful_count NUMERIC,
  unhelpful_count NUMERIC,
  author_id TEXT,
  author_name TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: LoyaltyPoint -> Table: loyalty_points
-- ============================================================
CREATE TABLE IF NOT EXISTS loyalty_points (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  user_name TEXT,
  business_id TEXT,
  business_name TEXT,
  points NUMERIC,
  points_before NUMERIC,
  balance_after NUMERIC,
  level_after TEXT,
  transaction_type TEXT,
  description TEXT,
  reference_id TEXT,
  reference_type TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: LoyaltyTier -> Table: loyalty_tiers
-- ============================================================
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  business_id TEXT,
  business_name TEXT,
  level_name TEXT,
  min_points NUMERIC,
  max_points NUMERIC,
  color TEXT,
  icon TEXT,
  benefits TEXT,
  points_multiplier NUMERIC,
  discount_bonus NUMERIC,
  priority_support BOOLEAN,
  free_monthly_gift BOOLEAN,
  sort_order NUMERIC,
  is_active BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: MembershipPlan -> Table: membership_plans
-- ============================================================
CREATE TABLE IF NOT EXISTS membership_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  description TEXT,
  plan_type TEXT,
  price NUMERIC,
  original_price NUMERIC,
  currency TEXT,
  billing_cycle TEXT,
  features TEXT,
  feature_entitlements TEXT,
  trial_days NUMERIC,
  is_promotional BOOLEAN,
  is_active BOOLEAN,
  is_archived BOOLEAN,
  archived_at TIMESTAMPTZ,
  sort_order NUMERIC,
  max_discount_percentage NUMERIC,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: NewsletterSubscriber -> Table: newsletter_subscribers
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  email TEXT,
  name TEXT,
  source TEXT,
  is_active BOOLEAN,
  subscribed_at TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Notification -> Table: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  user_id TEXT,
  title TEXT,
  message TEXT,
  type TEXT,
  priority TEXT,
  is_read BOOLEAN,
  is_archived BOOLEAN,
  action_url TEXT,
  action_label TEXT,
  channel TEXT,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  image_url TEXT,
  business_id TEXT,
  business_name TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: NotificationTemplate -> Table: notification_templates
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  key TEXT,
  channel TEXT,
  subject TEXT,
  body TEXT,
  variables TEXT,
  language TEXT,
  is_active BOOLEAN,
  version NUMERIC,
  previous_body TEXT,
  previous_subject TEXT,
  previous_version NUMERIC,
  created_by_id TEXT,
  created_by_name TEXT,
  updated_by_id TEXT,
  updated_by_name TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: OtpCode -> Table: otp_codes
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_codes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  user_id TEXT,
  phone_number TEXT,
  code_hash TEXT,
  delivery_method TEXT,
  expires_at TIMESTAMPTZ,
  attempts NUMERIC,
  verified BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: OutreachCampaign -> Table: outreach_campaigns
-- ============================================================
CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT,
  description TEXT,
  target_category TEXT,
  target_city TEXT,
  target_country TEXT,
  email_subject TEXT,
  email_body TEXT,
  recipients TEXT,
  status TEXT,
  total_recipients NUMERIC,
  sent_count NUMERIC,
  failed_count NUMERIC,
  response_count NUMERIC,
  sent_at TIMESTAMPTZ,
  created_by_name TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: PartnerReferral -> Table: partner_referrals
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_referrals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  partner_id TEXT,
  partner_name TEXT,
  partner_email TEXT,
  referral_code TEXT,
  referred_email TEXT,
  referred_name TEXT,
  referral_type TEXT,
  status TEXT,
  signed_up_date TIMESTAMPTZ,
  converted_date TIMESTAMPTZ,
  churned_date TIMESTAMPTZ,
  commission_rate NUMERIC,
  monthly_commission NUMERIC,
  total_commission_earned NUMERIC,
  is_active BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Payment -> Table: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  user_id TEXT,
  user_name TEXT,
  business_id TEXT,
  business_name TEXT,
  subscription_id TEXT,
  campaign_id TEXT,
  payment_method_id TEXT,
  amount NUMERIC,
  currency TEXT,
  payment_type TEXT,
  status TEXT,
  transaction_id TEXT,
  provider TEXT,
  provider_transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  failure_reason TEXT,
  refund_amount NUMERIC,
  refunded_at TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: PaymentMethod -> Table: payment_methods
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  user_id TEXT,
  user_name TEXT,
  type TEXT,
  provider TEXT,
  provider_payment_method_id TEXT,
  last4 TEXT,
  brand TEXT,
  expiry_month NUMERIC,
  expiry_year NUMERIC,
  is_default BOOLEAN,
  is_active BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Permission -> Table: permissions
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  description TEXT,
  resource TEXT,
  action TEXT,
  is_active BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: QrCode -> Table: qr_codes
-- ============================================================
CREATE TABLE IF NOT EXISTS qr_codes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  user_id TEXT,
  user_name TEXT,
  code TEXT,
  qr_token TEXT,
  status TEXT,
  generated_date TIMESTAMPTZ,
  activated_date TIMESTAMPTZ,
  deactivated_date TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  scan_count NUMERIC,
  last_scan_date TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Review -> Table: reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  business_id TEXT,
  business_name TEXT,
  rating NUMERIC,
  comment TEXT,
  customer_name TEXT,
  customer_id TEXT,
  branch_id TEXT,
  branch_name TEXT,
  employee_id TEXT,
  employee_name TEXT,
  transaction_id TEXT,
  resolution_status TEXT,
  is_verified BOOLEAN,
  sentiment TEXT,
  tags TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: ReviewReply -> Table: review_replies
-- ============================================================
CREATE TABLE IF NOT EXISTS review_replies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  review_id TEXT,
  business_id TEXT,
  business_name TEXT,
  author_name TEXT,
  author_id TEXT,
  content TEXT,
  is_business_reply BOOLEAN,
  is_active BOOLEAN,
  is_draft BOOLEAN,
  edited_at TIMESTAMPTZ,
  content_history TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Role -> Table: roles
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  description TEXT,
  is_system BOOLEAN,
  is_active BOOLEAN,
  sort_order NUMERIC,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: SavedSegment -> Table: saved_segments
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_segments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT,
  business_name TEXT,
  name TEXT,
  description TEXT,
  criteria TEXT,
  match_count NUMERIC,
  created_by_id TEXT,
  created_by_name TEXT,
  is_active BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: ScheduledReport -> Table: scheduled_reports
-- ============================================================
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  name TEXT,
  report_type TEXT,
  format TEXT,
  frequency TEXT,
  recipient_email TEXT,
  filters TEXT,
  is_active BOOLEAN,
  last_sent_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_by_id TEXT,
  created_by_name TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: SecurityIncident -> Table: security_incidents
-- ============================================================
CREATE TABLE IF NOT EXISTS security_incidents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT,
  description TEXT,
  type TEXT,
  severity TEXT,
  status TEXT,
  target_user_id TEXT,
  target_user_name TEXT,
  target_business_id TEXT,
  target_business_name TEXT,
  assigned_to_id TEXT,
  assigned_to_name TEXT,
  created_by_id TEXT,
  created_by_name TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  containment_actions TEXT,
  affected_records NUMERIC,
  evidence TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Session -> Table: sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  user_id TEXT,
  token_hash TEXT,
  device_info TEXT,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN,
  last_activity TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: SlaConfig -> Table: sla_configs
-- ============================================================
CREATE TABLE IF NOT EXISTS sla_configs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  name TEXT,
  priority TEXT,
  category TEXT,
  first_response_hours NUMERIC,
  resolution_hours NUMERIC,
  escalation_enabled BOOLEAN,
  is_active BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Subscription -> Table: subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  user_id TEXT,
  user_name TEXT,
  business_id TEXT,
  business_name TEXT,
  plan_id TEXT,
  plan_name TEXT,
  plan_type TEXT,
  amount NUMERIC,
  currency TEXT,
  billing_cycle TEXT,
  status TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  auto_renew BOOLEAN,
  payment_method_id TEXT,
  payment_id TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  renewal_count NUMERIC,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: SupportTicket -> Table: support_tickets
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  business_id TEXT,
  business_name TEXT,
  subject TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  category TEXT,
  assigned_to_id TEXT,
  assigned_to_name TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  source TEXT,
  requester_type TEXT,
  sla_due_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  csat_rating NUMERIC,
  csat_comment TEXT,
  merged_into_id TEXT,
  is_escalated BOOLEAN,
  tags TEXT,
  attachments TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: SystemSetting -> Table: system_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT,
  value TEXT,
  description TEXT,
  category TEXT,
  is_public BOOLEAN,
  is_encrypted BOOLEAN,
  is_critical BOOLEAN,
  previous_value TEXT,
  updated_by_id TEXT,
  updated_by_name TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: TaxConfig -> Table: tax_configs
-- ============================================================
CREATE TABLE IF NOT EXISTS tax_configs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  country TEXT,
  country_code TEXT,
  tax_name TEXT,
  tax_rate NUMERIC,
  applies_to TEXT,
  is_active BOOLEAN,
  created_by_id TEXT,
  created_by_name TEXT,
  updated_by_id TEXT,
  updated_by_name TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: TicketMessage -> Table: ticket_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_id TEXT,
  sender_id TEXT,
  sender_name TEXT,
  sender_role TEXT,
  body TEXT,
  attachments TEXT,
  is_internal_note BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: Transaction -> Table: transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  business_id TEXT,
  business_name TEXT,
  customer_id TEXT,
  customer_name TEXT,
  discount_percentage NUMERIC,
  original_amount NUMERIC,
  discount_amount NUMERIC,
  final_amount NUMERIC,
  status TEXT,
  transaction_date TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: User -> Table: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  role TEXT,
  admin_role TEXT,
  membership_type TEXT,
  membership_id TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  city TEXT,
  country TEXT,
  status TEXT,
  avatar_url TEXT,
  date_of_birth TIMESTAMPTZ,
  marketing_consent BOOLEAN,
  push_notifications_enabled BOOLEAN,
  preferred_language TEXT,
  preferred_currency TEXT,
  distance_units TEXT,
  last_login_date TIMESTAMPTZ,
  two_factor_enabled BOOLEAN,
  biometric_enabled BOOLEAN,
  data_sharing_consent BOOLEAN,
  location_permission TEXT,
  phone_verified BOOLEAN,
  profile_setup_completed BOOLEAN,
  account_verified BOOLEAN,
  deletion_requested BOOLEAN,
  deletion_requested_at TIMESTAMPTZ,
  accessibility_settings TEXT,
  app_settings TEXT,
  linked_providers TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: UserMembership -> Table: user_memberships
-- ============================================================
CREATE TABLE IF NOT EXISTS user_memberships (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  user_id TEXT,
  user_name TEXT,
  membership_id TEXT,
  plan_id TEXT,
  plan_name TEXT,
  qr_code_id TEXT,
  status TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancellation_feedback TEXT,
  cancelled_at TIMESTAMPTZ,
  grace_period_ends_at TIMESTAMPTZ,
  refund_issued BOOLEAN,
  refund_amount NUMERIC,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: WebhookConfig -> Table: webhook_configs
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_configs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  name TEXT,
  url TEXT,
  events TEXT,
  is_active BOOLEAN,
  secret TEXT,
  headers TEXT,
  last_triggered_at TIMESTAMPTZ,
  last_status TEXT,
  failure_count NUMERIC,
  created_by_id TEXT,
  created_by_name TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Entity: WebhookLog -> Table: webhook_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT,
  app_id TEXT,
  app_name TEXT,
  event_type TEXT,
  url TEXT,
  method TEXT,
  payload TEXT,
  response_status NUMERIC,
  response_body TEXT,
  attempt_count NUMERIC,
  duration_ms NUMERIC,
  status TEXT,
  next_retry_at TIMESTAMPTZ,
  error_message TEXT,
  is_test BOOLEAN,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- Trigger Function for updated_date
-- ============================================================
CREATE OR REPLACE FUNCTION touch_updated_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Triggers for updated_date on all tables
-- ============================================================
DROP TRIGGER IF EXISTS trg_touch_audit_logs ON audit_logs;
CREATE TRIGGER trg_touch_audit_logs BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_base44_purchases ON base44_purchases;
CREATE TRIGGER trg_touch_base44_purchases BEFORE UPDATE ON base44_purchases FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_blog_posts ON blog_posts;
CREATE TRIGGER trg_touch_blog_posts BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_bookings ON bookings;
CREATE TRIGGER trg_touch_bookings BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_businesses ON businesses;
CREATE TRIGGER trg_touch_businesses BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_business_categories ON business_categories;
CREATE TRIGGER trg_touch_business_categories BEFORE UPDATE ON business_categories FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_business_documents ON business_documents;
CREATE TRIGGER trg_touch_business_documents BEFORE UPDATE ON business_documents FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_business_email_blasts ON business_email_blasts;
CREATE TRIGGER trg_touch_business_email_blasts BEFORE UPDATE ON business_email_blasts FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_business_locations ON business_locations;
CREATE TRIGGER trg_touch_business_locations BEFORE UPDATE ON business_locations FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_campaigns ON campaigns;
CREATE TRIGGER trg_touch_campaigns BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_campaign_audiences ON campaign_audiences;
CREATE TRIGGER trg_touch_campaign_audiences BEFORE UPDATE ON campaign_audiences FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_campaign_messages ON campaign_messages;
CREATE TRIGGER trg_touch_campaign_messages BEFORE UPDATE ON campaign_messages FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_chat_messages ON chat_messages;
CREATE TRIGGER trg_touch_chat_messages BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_commission_payments ON commission_payments;
CREATE TRIGGER trg_touch_commission_payments BEFORE UPDATE ON commission_payments FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_compliance_requests ON compliance_requests;
CREATE TRIGGER trg_touch_compliance_requests BEFORE UPDATE ON compliance_requests FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_config_change_logs ON config_change_logs;
CREATE TRIGGER trg_touch_config_change_logs BEFORE UPDATE ON config_change_logs FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_coupons ON coupons;
CREATE TRIGGER trg_touch_coupons BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_crm_records ON crm_records;
CREATE TRIGGER trg_touch_crm_records BEFORE UPDATE ON crm_records FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_developer_apps ON developer_apps;
CREATE TRIGGER trg_touch_developer_apps BEFORE UPDATE ON developer_apps FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_devices ON devices;
CREATE TRIGGER trg_touch_devices BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_discounts ON discounts;
CREATE TRIGGER trg_touch_discounts BEFORE UPDATE ON discounts FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_disputes ON disputes;
CREATE TRIGGER trg_touch_disputes BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_employees ON employees;
CREATE TRIGGER trg_touch_employees BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_employee_schedules ON employee_schedules;
CREATE TRIGGER trg_touch_employee_schedules BEFORE UPDATE ON employee_schedules FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_favorites ON favorites;
CREATE TRIGGER trg_touch_favorites BEFORE UPDATE ON favorites FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_feature_flags ON feature_flags;
CREATE TRIGGER trg_touch_feature_flags BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_gift_campaigns ON gift_campaigns;
CREATE TRIGGER trg_touch_gift_campaigns BEFORE UPDATE ON gift_campaigns FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_gift_redemptions ON gift_redemptions;
CREATE TRIGGER trg_touch_gift_redemptions BEFORE UPDATE ON gift_redemptions FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_invoices ON invoices;
CREATE TRIGGER trg_touch_invoices BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_knowledge_bases ON knowledge_bases;
CREATE TRIGGER trg_touch_knowledge_bases BEFORE UPDATE ON knowledge_bases FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_loyalty_points ON loyalty_points;
CREATE TRIGGER trg_touch_loyalty_points BEFORE UPDATE ON loyalty_points FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_loyalty_tiers ON loyalty_tiers;
CREATE TRIGGER trg_touch_loyalty_tiers BEFORE UPDATE ON loyalty_tiers FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_membership_plans ON membership_plans;
CREATE TRIGGER trg_touch_membership_plans BEFORE UPDATE ON membership_plans FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_newsletter_subscribers ON newsletter_subscribers;
CREATE TRIGGER trg_touch_newsletter_subscribers BEFORE UPDATE ON newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_notifications ON notifications;
CREATE TRIGGER trg_touch_notifications BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_notification_templates ON notification_templates;
CREATE TRIGGER trg_touch_notification_templates BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_otp_codes ON otp_codes;
CREATE TRIGGER trg_touch_otp_codes BEFORE UPDATE ON otp_codes FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_outreach_campaigns ON outreach_campaigns;
CREATE TRIGGER trg_touch_outreach_campaigns BEFORE UPDATE ON outreach_campaigns FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_partner_referrals ON partner_referrals;
CREATE TRIGGER trg_touch_partner_referrals BEFORE UPDATE ON partner_referrals FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_payments ON payments;
CREATE TRIGGER trg_touch_payments BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_payment_methods ON payment_methods;
CREATE TRIGGER trg_touch_payment_methods BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_permissions ON permissions;
CREATE TRIGGER trg_touch_permissions BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_qr_codes ON qr_codes;
CREATE TRIGGER trg_touch_qr_codes BEFORE UPDATE ON qr_codes FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_reviews ON reviews;
CREATE TRIGGER trg_touch_reviews BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_review_replies ON review_replies;
CREATE TRIGGER trg_touch_review_replies BEFORE UPDATE ON review_replies FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_roles ON roles;
CREATE TRIGGER trg_touch_roles BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_saved_segments ON saved_segments;
CREATE TRIGGER trg_touch_saved_segments BEFORE UPDATE ON saved_segments FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_scheduled_reports ON scheduled_reports;
CREATE TRIGGER trg_touch_scheduled_reports BEFORE UPDATE ON scheduled_reports FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_security_incidents ON security_incidents;
CREATE TRIGGER trg_touch_security_incidents BEFORE UPDATE ON security_incidents FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_sessions ON sessions;
CREATE TRIGGER trg_touch_sessions BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_sla_configs ON sla_configs;
CREATE TRIGGER trg_touch_sla_configs BEFORE UPDATE ON sla_configs FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_subscriptions ON subscriptions;
CREATE TRIGGER trg_touch_subscriptions BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_support_tickets ON support_tickets;
CREATE TRIGGER trg_touch_support_tickets BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_system_settings ON system_settings;
CREATE TRIGGER trg_touch_system_settings BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_tax_configs ON tax_configs;
CREATE TRIGGER trg_touch_tax_configs BEFORE UPDATE ON tax_configs FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_ticket_messages ON ticket_messages;
CREATE TRIGGER trg_touch_ticket_messages BEFORE UPDATE ON ticket_messages FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_transactions ON transactions;
CREATE TRIGGER trg_touch_transactions BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_users ON users;
CREATE TRIGGER trg_touch_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_user_memberships ON user_memberships;
CREATE TRIGGER trg_touch_user_memberships BEFORE UPDATE ON user_memberships FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_webhook_configs ON webhook_configs;
CREATE TRIGGER trg_touch_webhook_configs BEFORE UPDATE ON webhook_configs FOR EACH ROW EXECUTE FUNCTION touch_updated_date();

DROP TRIGGER IF EXISTS trg_touch_webhook_logs ON webhook_logs;
CREATE TRIGGER trg_touch_webhook_logs BEFORE UPDATE ON webhook_logs FOR EACH ROW EXECUTE FUNCTION touch_updated_date();
