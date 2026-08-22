import{c as he,r as d,j as e,b as k,u as Te}from"./index-DA1EcbA_.js";import{B as x}from"./badge-CUu5CPWJ.js";import{B as N}from"./button-CVNsarCm.js";import{C as m,a as g,b,c as p}from"./card-hEELF-Vq.js";import{G as ge}from"./globe-t5hsFQWZ.js";import{K as V}from"./key-C1SxXeUR.js";import{S as F}from"./shield-BChxnhmk.js";import{L as be}from"./lock-X4ajr7wA.js";import{Z as $}from"./zap-DQkKQcge.js";import{S as je}from"./smartphone-Dxl1E9lA.js";import{W as M}from"./webhook-DkEO_3j3.js";import{F as ve}from"./flask-conical-PK95F8wQ.js";import{C as J}from"./code-xml-CRssvMJx.js";import{C as fe}from"./chart-column-DxXgrsSz.js";import{P as Pe}from"./plug-BxVxRFCQ.js";import{I as P}from"./input-BmB_hXfF.js";import{S as Ae}from"./search-CxeUqqh9.js";import{C as ee}from"./chevron-down-O2hcZiGP.js";import{C as se}from"./chevron-right-BEYWdidF.js";import{C as w}from"./check-DHjRMGyj.js";import{C as _}from"./copy-8T00cupx.js";import{T as Ce,a as Oe,b as W,c as G}from"./tabs-aRHMXZqP.js";import{T as Re}from"./triangle-alert-Y-hV2lrl.js";import{C as Y}from"./clock-CUCQwW0l.js";import{C as O}from"./circle-check-Bf4q89-h.js";import{R as z}from"./refresh-cw-BXtXnIsA.js";import{P as Q}from"./play-DvIpcJaq.js";import{C as ye}from"./circle-x-YO3gwQlO.js";import{L as S}from"./label-Cqi0oOHI.js";import{R as X}from"./responsive-select-D3qt6x1O.js";import{U as Ee}from"./users-CqctJKZT.js";import{B as qe}from"./building-2-BRl-9Vhv.js";import{Q as te}from"./qr-code-0BCVM_WF.js";import{T as Ie}from"./textarea-CMtbe2Z_.js";import{D as ae,f as De,a as re,b as ie,c as ne,d as oe}from"./dialog-DisLpgck.js";import{P as ce}from"./plus-CqM3OqAg.js";import{A as Be}from"./activity-Dc7Bu3So.js";import{R as Le,X as Ke,Y as He,T as We,B as de}from"./generateCategoricalChart-DXEyJBYT.js";import{B as Ge}from"./BarChart-CAyVTaA2.js";import{C as Fe}from"./CartesianGrid-DYvoRgce.js";import{T as Me}from"./trash-2-9rwH1lT4.js";import{E as le}from"./eye-off-Cm5ODvdP.js";import{E as me}from"./eye-Dr5uq2FJ.js";import{A as ze}from"./arrow-right-BTfexuur.js";import{M as Ue}from"./MobileBackHeader-FNjvD0iX.js";import"./index-B3j3PUIW.js";import"./index-DGDrOHKy.js";import"./index-FO6RNPNm.js";import"./index-BbPmfyY4.js";import"./index-C08CSNoc.js";import"./select-DF2eKRWX.js";import"./Combination-Dz-FR3c-.js";import"./index-DjWszGDw.js";import"./chevron-up-B5TssyD1.js";import"./drawer-CX4Et7B_.js";import"./index-W3YaZ9fH.js";import"./use-mobile-CYPxREU4.js";import"./chevron-left-BSrJ_uJI.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=[["path",{d:"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",key:"k3hazp"}]],Z=he("Book",$e);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Je=[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]],Qe=he("Terminal",Je),pe=[{service:"authApi",icon:"🔐",title:"Authentication Service",description:"User authentication, registration, OTP verification, password reset, session management",endpoints:[{action:"register",method:"POST",summary:"Register a new user account",params:{email:"string",password:"string",full_name:"string"},response:{user_id:"string",status:"unverified"},scopes:["public"]},{action:"verifyOtp",method:"POST",summary:"Verify OTP code and activate account",params:{email:"string",otp_code:"string"},response:{access_token:"string",user:"object"},scopes:["public"]},{action:"login",method:"POST",summary:"Authenticate with email and password",params:{email:"string",password:"string"},response:{access_token:"string",user:"object"},scopes:["public"]},{action:"resetPasswordRequest",method:"POST",summary:"Request password reset email",params:{email:"string"},response:{success:!0},scopes:["public"]},{action:"resetPassword",method:"POST",summary:"Reset password with token",params:{reset_token:"string",new_password:"string"},response:{success:!0},scopes:["public"]},{action:"getProfile",method:"GET",summary:"Get current user profile",params:{},response:{user:"object",membership:"object"},scopes:["read:profile"]}]},{service:"businessApi",icon:"🏪",title:"Business Service",description:"Business registration, profile management, search, categories, locations, employee management",endpoints:[{action:"register",method:"POST",summary:"Register a new business",params:{name:"string",category:"string",discount_percentage:"number",address:"string"},response:{business_id:"string",status:"pending"},scopes:["write:businesses"]},{action:"search",method:"POST",summary:"Search businesses with filters",params:{query:"string",city:"string",category:"string",limit:"number",offset:"number"},response:{results:"array",total:"number"},scopes:["read:businesses"]},{action:"get",method:"GET",summary:"Get business by ID",params:{business_id:"string"},response:{business:"object",locations:"array"},scopes:["read:businesses"]},{action:"update",method:"PUT",summary:"Update business profile",params:{business_id:"string",name:"string",description:"string"},response:{success:!0},scopes:["write:businesses"]},{action:"getCategories",method:"GET",summary:"List all business categories",params:{},response:{categories:"array"},scopes:["read:businesses"]},{action:"getLocations",method:"GET",summary:"Get business branch locations",params:{business_id:"string"},response:{locations:"array"},scopes:["read:businesses"]},{action:"getEmployees",method:"GET",summary:"List business employees",params:{business_id:"string"},response:{employees:"array"},scopes:["read:businesses"]}]},{service:"discountApi",icon:"🏷️",title:"Discount & Redemption Service",description:"QR scanning, discount listing and redemption, gift campaigns, coupon management",endpoints:[{action:"scanQr",method:"POST",summary:"Scan and validate a customer QR code",params:{qr_token:"string",business_id:"string"},response:{valid:"boolean",customer:"object",discount_percentage:"number"},scopes:["write:transactions"]},{action:"listDiscounts",method:"GET",summary:"List active discounts",params:{business_id:"string",category:"string",premium_only:"boolean"},response:{discounts:"array"},scopes:["read:discounts"]},{action:"redeemDiscount",method:"POST",summary:"Redeem a discount for a transaction",params:{discount_id:"string",business_id:"string",original_amount:"number"},response:{transaction_id:"string",discount_amount:"number",final_amount:"number"},scopes:["write:transactions"]},{action:"listGifts",method:"GET",summary:"List available gift campaigns",params:{business_id:"string"},response:{gifts:"array"},scopes:["read:discounts"]},{action:"redeemGift",method:"POST",summary:"Redeem a gift campaign reward",params:{gift_campaign_id:"string",user_id:"string"},response:{redemption_id:"string",status:"redeemed"},scopes:["write:transactions"]},{action:"listCoupons",method:"GET",summary:"List active coupons",params:{user_id:"string"},response:{coupons:"array"},scopes:["read:discounts"]}]},{service:"membershipApi",icon:"💳",title:"Membership & Subscription Service",description:"Subscription plans, billing, upgrades, cancellations, referral tracking",endpoints:[{action:"getPlans",method:"GET",summary:"List all membership plans",params:{plan_type:"string"},response:{plans:"array"},scopes:["read:membership"]},{action:"subscribe",method:"POST",summary:"Subscribe to a membership plan",params:{plan_id:"string",payment_method_id:"string"},response:{subscription_id:"string",status:"active"},scopes:["write:membership"]},{action:"getSubscription",method:"GET",summary:"Get current subscription details",params:{user_id:"string"},response:{subscription:"object"},scopes:["read:membership"]},{action:"upgradePlan",method:"POST",summary:"Upgrade to a higher tier plan",params:{subscription_id:"string",new_plan_id:"string"},response:{success:!0,new_plan:"string"},scopes:["write:membership"]},{action:"cancelSubscription",method:"POST",summary:"Cancel an active subscription",params:{subscription_id:"string",reason:"string"},response:{success:!0,cancelled_at:"string"},scopes:["write:membership"]},{action:"getReferrals",method:"GET",summary:"Get referral history and stats",params:{user_id:"string"},response:{referrals:"array",total_earned:"number"},scopes:["read:membership"]}]},{service:"qrWalletApi",icon:"📱",title:"QR Wallet Service",description:"Cryptographic QR token generation, one-time-use validation, screenshot detection, redemption history",endpoints:[{action:"generateQr",method:"POST",summary:"Generate a one-time-use QR token",params:{user_id:"string"},response:{qr_token:"string",expires_at:"string"},scopes:["write:qr"]},{action:"validateQr",method:"POST",summary:"Validate a QR token at point of sale",params:{qr_token:"string",business_id:"string"},response:{valid:"boolean",user_id:"string",discount_percentage:"number"},scopes:["write:transactions"]},{action:"getHistory",method:"GET",summary:"Get QR redemption history",params:{user_id:"string",limit:"number"},response:{history:"array"},scopes:["read:qr"]},{action:"reportScreenshot",method:"POST",summary:"Report a screenshot detection event",params:{qr_token:"string",device_id:"string"},response:{flagged:!0,incident_id:"string"},scopes:["write:security"]}]},{service:"notificationApi",icon:"🔔",title:"Notification Service",description:"Multi-channel notification dispatch — in-app, email, push, SMS, preferences management",endpoints:[{action:"send",method:"POST",summary:"Send a notification to a user",params:{user_id:"string",title:"string",message:"string",type:"string",channel:"string"},response:{notification_id:"string"},scopes:["write:notifications"]},{action:"sendBulk",method:"POST",summary:"Send notification to multiple users",params:{user_ids:"array",title:"string",message:"string"},response:{sent:"number",failed:"number"},scopes:["write:notifications"]},{action:"broadcast",method:"POST",summary:"Broadcast to all users",params:{title:"string",message:"string",channels:"array"},response:{sent:"number"},scopes:["write:notifications"]},{action:"getPreferences",method:"GET",summary:"Get notification preferences",params:{user_id:"string"},response:{preferences:"object"},scopes:["read:notifications"]},{action:"updatePreferences",method:"PUT",summary:"Update notification preferences",params:{user_id:"string",preferences:"object"},response:{success:!0},scopes:["write:notifications"]}]},{service:"analyticsApi",icon:"📈",title:"Analytics Service",description:"Platform-wide, per-business, and per-customer analytics with charts and KPIs",endpoints:[{action:"getPlatformAnalytics",method:"GET",summary:"Get platform-wide analytics",params:{date_from:"string",date_to:"string"},response:{metrics:"object",charts:"object"},scopes:["read:analytics"]},{action:"getBusinessAnalytics",method:"GET",summary:"Get analytics for a business",params:{business_id:"string",metric:"string"},response:{metrics:"object",trends:"array"},scopes:["read:analytics"]},{action:"getCustomerAnalytics",method:"GET",summary:"Get customer-level analytics",params:{user_id:"string"},response:{savings:"number",transactions:"array"},scopes:["read:analytics"]}]},{service:"securityApi",icon:"🛡️",title:"Security & Fraud Detection",description:"Fraud detection, transaction risk scoring, user risk profiles, rate limiting",endpoints:[{action:"checkTransaction",method:"POST",summary:"Check a transaction for fraud risk",params:{transaction_id:"string",amount:"number",user_id:"string"},response:{risk_score:"number",flagged:"boolean"},scopes:["read:security"]},{action:"getUserRiskProfile",method:"GET",summary:"Get user risk profile",params:{user_id:"string"},response:{risk_level:"string",score:"number"},scopes:["read:security"]},{action:"rateLimit",method:"POST",summary:"Check rate limit for an action",params:{key:"string",limit:"number",window:"number"},response:{allowed:"boolean",remaining:"number"},scopes:["read:security"]}]},{service:"recommendationApi",icon:"🤖",title:"AI Recommendation Service",description:"AI-powered personalized business recommendations and membership plan suggestions",endpoints:[{action:"recommendBusinesses",method:"GET",summary:"Get personalized business recommendations",params:{user_id:"string",limit:"number"},response:{recommendations:"array"},scopes:["read:recommendations"]},{action:"recommendPlans",method:"GET",summary:"Suggest membership plans",params:{user_id:"string"},response:{plans:"array"},scopes:["read:recommendations"]},{action:"getSimilarBusinesses",method:"GET",summary:"Find similar businesses",params:{business_id:"string",limit:"number"},response:{businesses:"array"},scopes:["read:businesses"]}]},{service:"loyaltyApi",icon:"🎁",title:"Loyalty & Gifts Service",description:"Loyalty points, tiers, gift campaigns, reward redemptions, milestone tracking",endpoints:[{action:"getPoints",method:"GET",summary:"Get user loyalty points balance",params:{user_id:"string",business_id:"string"},response:{balance:"number",tier:"string"},scopes:["read:loyalty"]},{action:"earnPoints",method:"POST",summary:"Award loyalty points",params:{user_id:"string",business_id:"string",points:"number",reference_id:"string"},response:{new_balance:"number"},scopes:["write:loyalty"]},{action:"spendPoints",method:"POST",summary:"Redeem loyalty points",params:{user_id:"string",business_id:"string",points:"number"},response:{new_balance:"number",redemption_id:"string"},scopes:["write:loyalty"]},{action:"getTiers",method:"GET",summary:"List loyalty tiers",params:{business_id:"string"},response:{tiers:"array"},scopes:["read:loyalty"]}]}],Xe=[{code:400,name:"Bad Request",description:"The request was malformed or missing required parameters.",example:'{"error": "Missing required field: email"}'},{code:401,name:"Unauthorized",description:"Authentication credentials are missing or invalid.",example:'{"error": "Invalid or expired access token"}'},{code:403,name:"Forbidden",description:"The authenticated user lacks permission for this action.",example:'{"error": "Insufficient scope: requires write:businesses"}'},{code:404,name:"Not Found",description:"The requested resource does not exist.",example:'{"error": "Business not found: 6a529793..."}'},{code:409,name:"Conflict",description:"The request conflicts with the current state of the resource.",example:'{"error": "Email already registered"}'},{code:422,name:"Validation Error",description:"The request data failed validation.",example:'{"error": "discount_percentage must be between 5 and 20", "field": "discount_percentage"}'},{code:429,name:"Rate Limited",description:"Too many requests in the time window.",example:'{"error": "Rate limit exceeded. Retry after 60s", "retry_after": 60}'},{code:500,name:"Internal Server Error",description:"An unexpected error occurred on the server.",example:'{"error": "Internal server error", "request_id": "req_..."}'},{code:503,name:"Service Unavailable",description:"The service is temporarily unavailable for maintenance.",example:'{"error": "Service temporarily unavailable", "retry_after": 300}'}],Ve=[{event:"business.registered",description:"Fired when a new business registers on the platform",payload:'{ "event": "business.registered", "data": { "business_id": "string", "name": "string", "category": "string", "status": "pending" }, "timestamp": "ISO 8601" }'},{event:"business.verified",description:"Fired when a business passes verification",payload:'{ "event": "business.verified", "data": { "business_id": "string", "verified_at": "ISO 8601" }, "timestamp": "ISO 8601" }'},{event:"discount.redeemed",description:"Fired when a customer redeems a discount at a business",payload:'{ "event": "discount.redeemed", "data": { "transaction_id": "string", "business_id": "string", "user_id": "string", "discount_amount": "number", "final_amount": "number" }, "timestamp": "ISO 8601" }'},{event:"qr.scanned",description:"Fired when a QR code is scanned at point of sale",payload:'{ "event": "qr.scanned", "data": { "qr_token": "string", "business_id": "string", "user_id": "string", "valid": "boolean" }, "timestamp": "ISO 8601" }'},{event:"member.joined",description:"Fired when a new member subscribes",payload:'{ "event": "member.joined", "data": { "user_id": "string", "plan_name": "string", "billing_cycle": "string" }, "timestamp": "ISO 8601" }'},{event:"member.upgraded",description:"Fired when a member upgrades their plan",payload:'{ "event": "member.upgraded", "data": { "user_id": "string", "old_plan": "string", "new_plan": "string" }, "timestamp": "ISO 8601" }'},{event:"review.posted",description:"Fired when a customer posts a review",payload:'{ "event": "review.posted", "data": { "review_id": "string", "business_id": "string", "rating": "number", "comment": "string" }, "timestamp": "ISO 8601" }'},{event:"payment.completed",description:"Fired when a payment is successfully processed",payload:'{ "event": "payment.completed", "data": { "payment_id": "string", "amount": "number", "currency": "string", "subscription_id": "string" }, "timestamp": "ISO 8601" }'},{event:"payment.failed",description:"Fired when a payment fails",payload:'{ "event": "payment.failed", "data": { "payment_id": "string", "amount": "number", "failure_reason": "string" }, "timestamp": "ISO 8601" }'},{event:"gift.sent",description:"Fired when a gift campaign sends rewards",payload:'{ "event": "gift.sent", "data": { "gift_campaign_id": "string", "user_ids": "array", "gift_type": "string", "value": "number" }, "timestamp": "ISO 8601" }'},{event:"gift.redeemed",description:"Fired when a customer redeems a gift",payload:'{ "event": "gift.redeemed", "data": { "redemption_id": "string", "gift_campaign_id": "string", "user_id": "string" }, "timestamp": "ISO 8601" }'},{event:"campaign.sent",description:"Fired when a marketing campaign is dispatched",payload:'{ "event": "campaign.sent", "data": { "campaign_id": "string", "channel": "string", "recipient_count": "number" }, "timestamp": "ISO 8601" }'}],Ye=[{name:"JavaScript / Web SDK",icon:"🟨",language:"JavaScript",description:"Official SDK for React, Vue, Angular, and vanilla JS applications.",install:"npm install @onepass/sdk-js",code:`import OnePass from '@onepass/sdk-js';

const client = new OnePass({
  apiKey: 'op_live_your_api_key',
  environment: 'production' // or 'sandbox'
});

// Search businesses
const results = await client.businesses.search({
  city: 'Berlin',
  category: 'restaurants'
});

// Redeem a discount
const redemption = await client.discounts.redeem({
  discount_id: 'disc_123',
  business_id: 'biz_456',
  original_amount: 50.00
});`},{name:"Flutter SDK",icon:"🐦",language:"Dart",description:"Cross-platform mobile SDK for iOS and Android via Flutter.",install:"flutter pub add onepass_sdk",code:`import 'package:onepass_sdk/onepass_sdk.dart';

final client = OnePass(
  apiKey: 'op_live_your_api_key',
  environment: Environment.production,
);

// Get membership status
final membership = await client.membership.get();

// Generate QR code
final qr = await client.qrWallet.generate();

// Show in UI
QrImageView(data: qr.token);`},{name:"iOS SDK",icon:"🍎",language:"Swift",description:"Native SDK for iOS apps written in Swift.",install:"pod 'OnePassSDK'",code:`import OnePassSDK

let client = OnePass(apiKey: "op_live_your_api_key",
                     environment: .production)

// Fetch nearby businesses
client.businesses.search(city: "Berlin") { result in
    switch result {
    case .success(let businesses):
        print("Found \\(businesses.count) businesses")
    case .failure(let error):
        print("Error: \\(error)")
    }
}`},{name:"Android SDK",icon:"🤖",language:"Kotlin",description:"Native SDK for Android apps written in Kotlin.",install:"implementation 'app.onepass:sdk:1.0.0'",code:`import app.onepass.sdk.OnePass

val client = OnePass(
    apiKey = "op_live_your_api_key",
    environment = Environment.PRODUCTION
)

// Search businesses
client.businesses.search(
    city = "Berlin",
    category = "restaurants"
).onSuccess { businesses ->
    println("Found \${businesses.size} businesses")
}.onFailure { error ->
    println("Error: \${error.message}")
}`},{name:"Backend SDK",icon:"🖥️",language:"Node.js",description:"Server-side SDK for Node.js backends and API servers.",install:"npm install @onepass/sdk-node",code:`import { OnePass } from '@onepass/sdk-node';

const onepass = new OnePass({
  apiKey: process.env.ONEPASS_API_KEY,
  environment: 'production'
});

// Webhook signature verification
app.post('/webhooks/onepass',
  onepass.webhooks.verifyMiddleware(),
  (req, res) => {
    const { event, data } = req.body;
    if (event === 'discount.redeemed') {
      console.log('Discount redeemed:', data.transaction_id);
    }
    res.json({ received: true });
  }
);`}],Ze=[{title:"Authentication",icon:"🔐",description:"Obtain an access token using the OAuth 2.0 password grant.",languages:{curl:`curl -X POST https://api.onepass.app/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_type": "password",
    "client_id": "op_live_your_api_key",
    "client_secret": "your_api_secret",
    "email": "user@example.com",
    "password": "secret123"
  }'`,javascript:`const response = await fetch('https://api.onepass.app/v1/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'password',
    client_id: process.env.ONEPASS_API_KEY,
    client_secret: process.env.ONEPASS_API_SECRET,
    email: 'user@example.com',
    password: 'secret123'
  })
});

const { access_token } = await response.json();
localStorage.setItem('onepass_token', access_token);`,python:`import requests

response = requests.post('https://api.onepass.app/v1/auth/token', json={
    'grant_type': 'password',
    'client_id': os.environ['ONEPASS_API_KEY'],
    'client_secret': os.environ['ONEPASS_API_SECRET'],
    'email': 'user@example.com',
    'password': 'secret123'
})

access_token = response.json()['access_token']`,dart:`import 'package:http/http.dart' as http;

final response = await http.post(
  Uri.parse('https://api.onepass.app/v1/auth/token'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'grant_type': 'password',
    'client_id': apiKey,
    'client_secret': apiSecret,
    'email': email,
    'password': password,
  }),
);

final token = jsonDecode(response.body)['access_token'];`}},{title:"Business Search",icon:"🔍",description:"Search for businesses with filters and pagination.",languages:{curl:`curl -X POST https://api.onepass.app/v1/businesses/search \\
  -H "Authorization: Bearer op_live_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "italian restaurant",
    "city": "Berlin",
    "category": "restaurants",
    "limit": 10
  }'`,javascript:`const response = await fetch('https://api.onepass.app/v1/businesses/search', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'italian restaurant',
    city: 'Berlin',
    category: 'restaurants',
    limit: 10
  })
});

const { results, total } = await response.json();`,python:`response = requests.post(
    'https://api.onepass.app/v1/businesses/search',
    headers={'Authorization': f'Bearer {token}'},
    json={
        'query': 'italian restaurant',
        'city': 'Berlin',
        'category': 'restaurants',
        'limit': 10
    }
)

data = response.json()
results = data['results']`,dart:`final response = await http.post(
  Uri.parse('https://api.onepass.app/v1/businesses/search'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'query': 'italian restaurant',
    'city': 'Berlin',
    'limit': 10,
  }),
);`}},{title:"QR Code Validation",icon:"📱",description:"Validate a customer QR code at the point of sale.",languages:{curl:`curl -X POST https://api.onepass.app/v1/qr/validate \\
  -H "Authorization: Bearer op_live_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "qr_token": "op_live_abc123...",
    "business_id": "biz_456"
  }'`,javascript:`const response = await fetch('https://api.onepass.app/v1/qr/validate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qr_token: qrToken,
    business_id: businessId
  })
});

const { valid, discount_percentage, customer } = await response.json();
if (valid) {
  // Apply discount
}`,python:`response = requests.post(
    'https://api.onepass.app/v1/qr/validate',
    headers={'Authorization': f'Bearer {token}'},
    json={
        'qr_token': qr_token,
        'business_id': business_id
    }
)

data = response.json()
if data['valid']:
    discount = data['discount_percentage']`,dart:`final response = await http.post(
  Uri.parse('https://api.onepass.app/v1/qr/validate'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'qr_token': qrToken,
    'business_id': businessId,
  }),
);

final result = jsonDecode(response.body);
if (result['valid'] == true) {
  // Apply discount
}`}},{title:"Membership Status",icon:"💳",description:"Check a user's current membership and subscription status.",languages:{curl:`curl -X GET https://api.onepass.app/v1/membership/status \\
  -H "Authorization: Bearer op_live_token"`,javascript:`const response = await fetch('https://api.onepass.app/v1/membership/status', {
  headers: { 'Authorization': 'Bearer ' + accessToken }
});

const { subscription, plan, status } = await response.json();
console.log('Plan:', plan, 'Status:', status);`,python:`response = requests.get(
    'https://api.onepass.app/v1/membership/status',
    headers={'Authorization': f'Bearer {token}'}
)

data = response.json()
print(f"Plan: {data['plan']}, Status: {data['status']}")`,dart:`final response = await http.get(
  Uri.parse('https://api.onepass.app/v1/membership/status'),
  headers: {'Authorization': 'Bearer $token'},
);

final membership = jsonDecode(response.body);
print('Plan: \${membership['plan']}');`}},{title:"Webhook Handling",icon:"🔗",description:"Receive and verify webhook events on your server.",languages:{curl:`# Your webhook endpoint receives:
POST /webhooks/onepass
Headers:
  X-OnePass-Signature: <hmac_sha256_signature>
  X-OnePass-Event: discount.redeemed
  Content-Type: application/json

Body:
{ "event": "discount.redeemed", "data": {...}, "timestamp": "..." }`,javascript:`import crypto from 'crypto';

app.post('/webhooks/onepass', (req, res) => {
  const signature = req.headers['x-onepass-signature'];
  const event = req.headers['x-onepass-event'];
  const body = JSON.stringify(req.body);

  // Verify HMAC signature
  const expected = crypto
    .createHmac('sha256', process.env.ONEPASS_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (signature !== expected) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Handle event
  switch (event) {
    case 'discount.redeemed':
      handleDiscountRedeemed(req.body.data);
      break;
    case 'member.joined':
      handleMemberJoined(req.body.data);
      break;
  }

  res.json({ received: true });
});`,python:`import hmac, hashlib
from flask import Flask, request

@app.route('/webhooks/onepass', methods=['POST'])
def webhook():
    signature = request.headers.get('X-OnePass-Signature')
    event = request.headers.get('X-OnePass-Event')
    body = request.get_data()

    expected = hmac.new(
        os.environ['ONEPASS_WEBHOOK_SECRET'].encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        return jsonify({'error': 'Invalid signature'}), 401

    data = request.json
    if event == 'discount.redeemed':
        handle_discount_redeemed(data['data'])

    return jsonify({'received': True})`,dart:`// Dart server-side (shelf/dart_frog)
Future<Response> handler(Request request) async {
  final signature = request.headers['x-onepass-signature'];
  final event = request.headers['x-onepass-event'];
  final body = await request.readAsString();

  final expected = Hmac(sha256, secretBytes)
      .convert(utf8.encode(body))
      .hex();

  if (signature != expected) {
    return Response(401, body: 'Invalid signature');
  }

  final data = jsonDecode(body);
  if (event == 'discount.redeemed') {
    handleDiscountRedeemed(data['data']);
  }

  return Response.ok('{"received": true}');
}`}}],es=[{category:"POS Systems",icon:"💳",color:"text-blue-600 bg-blue-50",items:[{name:"Square",description:"Sync transactions and apply OnePass discounts at checkout",status:"available",docs:"Syncs transaction data in real-time, applies discount at line-item level."},{name:"Toast",description:"Restaurant POS integration for dine-in and takeout",status:"available",docs:"Two-way sync of orders, automatic discount application for verified members."},{name:"Lightspeed",description:"Retail and hospitality POS integration",status:"available",docs:"Product catalog sync, member discount at point of sale."},{name:"Clover",description:"Small business POS with QR scan support",status:"available",docs:"Native QR scanner integration, automatic discount calculation."}]},{category:"CRM Systems",icon:"👥",color:"text-purple-600 bg-purple-50",items:[{name:"HubSpot",description:"Sync customer profiles and loyalty data",status:"available",docs:"Bi-directional contact sync, loyalty points as custom properties."},{name:"Salesforce",description:"Enterprise CRM with custom objects",status:"available",docs:"OnePass members as Salesforce contacts, transaction history as custom objects."},{name:"Zoho CRM",description:"SMB CRM integration with lead tracking",status:"available",docs:"Contact sync, membership tier as lead score."}]},{category:"ERP Systems",icon:"🏗️",color:"text-orange-600 bg-orange-50",items:[{name:"SAP",description:"Enterprise resource planning integration",status:"planned",docs:"SAP S/4HANA integration for invoice and payment sync."},{name:"Oracle NetSuite",description:"Cloud ERP for financial reporting",status:"planned",docs:"Transaction sync, revenue recognition for discounts."},{name:"Microsoft Dynamics",description:"Business central integration",status:"available",docs:"Customer sync, sales order integration with discounts."}]},{category:"Accounting",icon:"📊",color:"text-emerald-600 bg-emerald-50",items:[{name:"QuickBooks",description:"Sync invoices and payments",status:"available",docs:"Auto-create invoices for subscriptions, sync payment records."},{name:"Xero",description:"Cloud accounting with bank reconciliation",status:"available",docs:"Subscription payments as bank transactions, invoice sync."},{name:"FreshBooks",description:"Small business invoicing and time tracking",status:"planned",docs:"Invoice generation, expense tracking for business subscriptions."}]},{category:"Marketing Platforms",icon:"📣",color:"text-pink-600 bg-pink-50",items:[{name:"Mailchimp",description:"Email marketing with member segmentation",status:"available",docs:"Sync member segments as Mailchimp audiences, trigger campaigns on membership events."},{name:"Klaviyo",description:"Data-driven email and SMS marketing",status:"available",docs:"Real-time member events as Klaviyo metrics, behavioral triggers."},{name:"Meta Ads",description:"Sync custom audiences from membership data",status:"available",docs:"Premium members as custom audience, lookalike audience generation."}]}],ss=[{icon:ge,title:"RESTful JSON",desc:"All APIs communicate via JSON over HTTPS"},{icon:V,title:"OAuth 2.0 / JWT",desc:"Bearer token authentication with scoped access"},{icon:F,title:"RBAC",desc:"Role-based access control (admin, business, user)"},{icon:be,title:"HTTPS / TLS 1.3",desc:"Encrypted in transit, all endpoints HTTPS only"},{icon:$,title:"Rate Limiting",desc:"100 req/min sandbox, 500 req/min production"},{icon:Z,title:"Audit Logging",desc:"Every state-changing action is audit-logged"}],ts=[{id:"docs",label:"API Docs",icon:Z},{id:"auth",label:"Auth & Security",icon:F},{id:"sdks",label:"SDKs",icon:je},{id:"webhooks",label:"Webhooks",icon:M},{id:"sandbox",label:"Sandbox",icon:ve},{id:"examples",label:"Code Examples",icon:J},{id:"dashboard",label:"Dashboard",icon:fe},{id:"integrations",label:"Integrations",icon:Pe}],as={GET:"bg-emerald-100 text-emerald-700",POST:"bg-blue-100 text-blue-700",PUT:"bg-amber-100 text-amber-700",DELETE:"bg-red-100 text-red-700"};function ue({code:a}){const[l,c]=d.useState(!1),n=()=>{navigator.clipboard.writeText(a),c(!0),setTimeout(()=>c(!1),2e3)};return e.jsxs("div",{className:"relative group",children:[e.jsx("button",{onClick:n,className:"absolute top-2 right-2 p-1.5 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity",children:l?e.jsx(w,{className:"w-3.5 h-3.5"}):e.jsx(_,{className:"w-3.5 h-3.5"})}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded-lg p-4 text-xs font-mono overflow-x-auto",children:e.jsx("code",{children:a})})]})}function xe(){const[a,l]=d.useState(""),[c,n]=d.useState(null),[o,u]=d.useState(null),v=d.useMemo(()=>{if(!a)return pe;const i=a.toLowerCase();return pe.map(r=>({...r,endpoints:r.endpoints.filter(y=>y.action.toLowerCase().includes(i)||y.summary.toLowerCase().includes(i)||y.method.toLowerCase().includes(i))})).filter(r=>r.endpoints.length>0||r.service.toLowerCase().includes(i)||r.title.toLowerCase().includes(i))},[a]);return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"relative max-w-xl mx-auto",children:[e.jsx(Ae,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"}),e.jsx(P,{placeholder:"Search endpoints, services, actions...",value:a,onChange:i=>l(i.target.value),className:"pl-10"})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-1",children:"REST API Reference"}),e.jsxs("p",{className:"text-sm text-muted-foreground mb-4",children:[v.length," services · ",v.reduce((i,r)=>i+r.endpoints.length,0)," endpoints"]}),e.jsx("div",{className:"space-y-3",children:v.map(i=>e.jsxs(m,{className:"overflow-hidden",children:[e.jsxs(g,{className:"cursor-pointer pb-3",onClick:()=>n(c===i.service?null:i.service),children:[e.jsxs(b,{className:"flex items-center gap-2 text-base",children:[c===i.service?e.jsx(ee,{className:"w-4 h-4"}):e.jsx(se,{className:"w-4 h-4"}),e.jsx("span",{className:"text-xl",children:i.icon}),e.jsx("span",{children:i.title}),e.jsx("code",{className:"text-indigo-600 text-sm font-mono ml-1",children:i.service}),e.jsx(x,{variant:"secondary",className:"ml-auto",children:i.endpoints.length})]}),e.jsx("p",{className:"text-sm text-muted-foreground ml-6",children:i.description})]}),c===i.service&&e.jsx(p,{className:"pt-0",children:e.jsx("div",{className:"ml-6 space-y-2",children:i.endpoints.map(r=>e.jsxs("div",{className:"border border-border rounded-lg overflow-hidden",children:[e.jsxs("div",{className:"flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer",onClick:()=>u(o===`${i.service}.${r.action}`?null:`${i.service}.${r.action}`),children:[e.jsx("span",{className:`px-2 py-0.5 rounded text-xs font-bold font-mono ${as[r.method]||"bg-gray-100 text-gray-700"}`,children:r.method}),e.jsx("code",{className:"text-sm font-mono",children:i.service}),e.jsx("span",{className:"text-muted-foreground",children:"→"}),e.jsx("code",{className:"text-sm font-mono text-slate-600",children:r.action}),e.jsx("span",{className:"text-xs text-muted-foreground ml-auto hidden md:block",children:r.summary}),o===`${i.service}.${r.action}`?e.jsx(ee,{className:"w-4 h-4"}):e.jsx(se,{className:"w-4 h-4"})]}),o===`${i.service}.${r.action}`&&e.jsxs("div",{className:"px-3 pb-3 space-y-3 border-t border-border bg-slate-50/50",children:[e.jsx("p",{className:"text-sm pt-2",children:r.summary}),e.jsxs("div",{className:"grid md:grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-semibold mb-1",children:"Request Parameters"}),e.jsx(ue,{code:JSON.stringify(r.params,null,2)})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-semibold mb-1",children:"Response Shape"}),e.jsx(ue,{code:JSON.stringify(r.response,null,2)})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs font-semibold",children:"Required Scopes:"}),r.scopes.map(y=>e.jsx(x,{variant:"outline",className:"text-xs font-mono",children:y},y))]})]})]},r.action))})})]},i.service))})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-1",children:"Error Codes & Responses"}),e.jsx("p",{className:"text-sm text-muted-foreground mb-4",children:"Standard HTTP status codes returned by all API endpoints"}),e.jsx("div",{className:"grid gap-3",children:Xe.map(i=>e.jsx(m,{children:e.jsxs(p,{className:"p-4 flex items-start gap-4",children:[e.jsx(x,{className:i.code<400?"bg-emerald-100 text-emerald-700":i.code<500?"bg-amber-100 text-amber-700":"bg-red-100 text-red-700",children:i.code}),e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-semibold text-sm",children:i.name}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:i.description}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded mt-2 p-2 text-xs font-mono overflow-x-auto",children:e.jsx("code",{children:i.example})})]})]})},i.code))})]})]})}const rs=[{name:"Authorization Code",useCase:"Server-side web apps",flow:`1. Redirect user to /oauth/authorize
2. User grants permission
3. Callback receives code
4. Exchange code for token`,grant:"authorization_code"},{name:"Client Credentials",useCase:"Server-to-server API calls",flow:`1. POST to /oauth/token
2. Include client_id + secret
3. Receive access_token`,grant:"client_credentials"},{name:"Password Grant",useCase:"First-party mobile apps",flow:`1. POST credentials to /oauth/token
2. Receive access_token
3. Use token for API calls`,grant:"password"},{name:"Refresh Token",useCase:"Renew expired access tokens",flow:`1. POST refresh_token to /oauth/token
2. Receive new access_token`,grant:"refresh_token"}],is=[{scope:"read:businesses",description:"Search and view business profiles",level:"Read"},{scope:"write:businesses",description:"Create and update business data",level:"Write"},{scope:"read:members",description:"View member profiles and status",level:"Read"},{scope:"write:membership",description:"Manage subscriptions and billing",level:"Write"},{scope:"read:discounts",description:"List and view available discounts",level:"Read"},{scope:"write:transactions",description:"Process QR scans and redemptions",level:"Write"},{scope:"read:analytics",description:"Access analytics and reporting data",level:"Read"},{scope:"write:notifications",description:"Send notifications to users",level:"Write"},{scope:"read:loyalty",description:"View loyalty points and tiers",level:"Read"},{scope:"write:loyalty",description:"Award and redeem loyalty points",level:"Write"},{scope:"read:security",description:"Access fraud and risk data",level:"Read"},{scope:"write:security",description:"Report security incidents",level:"Write"}],ns=[{tier:"Sandbox",limit:"100 req/min",burst:"200 req",description:"For development and testing"},{tier:"Production (Free)",limit:"500 req/min",burst:"1000 req",description:"Standard production access"},{tier:"Production (Pro)",limit:"2,000 req/min",burst:"5,000 req",description:"High-volume integrations"},{tier:"Enterprise",limit:"10,000 req/min",burst:"25,000 req",description:"Custom SLA and dedicated infrastructure"}];function os(){const[a,l]=d.useState(""),c=(n,o)=>{navigator.clipboard.writeText(n),l(o),setTimeout(()=>l(""),2e3)};return e.jsxs(Ce,{defaultValue:"oauth",className:"space-y-6",children:[e.jsxs(Oe,{className:"grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl",children:[e.jsxs(W,{value:"oauth",children:[e.jsx(V,{className:"w-3.5 h-3.5 mr-1"})," OAuth 2.0"]}),e.jsxs(W,{value:"apikeys",children:[e.jsx(F,{className:"w-3.5 h-3.5 mr-1"})," API Keys"]}),e.jsxs(W,{value:"jwt",children:[e.jsx(be,{className:"w-3.5 h-3.5 mr-1"})," JWT"]}),e.jsxs(W,{value:"ratelimit",children:[e.jsx($,{className:"w-3.5 h-3.5 mr-1"})," Rate Limits"]})]}),e.jsxs(G,{value:"oauth",className:"space-y-4",children:[e.jsxs(m,{children:[e.jsx(g,{children:e.jsx(b,{className:"text-base",children:"OAuth 2.0 Authentication"})}),e.jsxs(p,{className:"space-y-4",children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"OnePass uses OAuth 2.0 for secure, scoped API access. Choose the flow that matches your application type."}),e.jsx("div",{className:"grid md:grid-cols-2 gap-3",children:rs.map(n=>e.jsx(m,{className:"border-border",children:e.jsxs(p,{className:"p-4",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("p",{className:"font-semibold text-sm",children:n.name}),e.jsx(x,{variant:"secondary",className:"text-xs font-mono",children:n.grant})]}),e.jsx("p",{className:"text-xs text-muted-foreground mb-2",children:n.useCase}),e.jsx("pre",{className:"bg-slate-50 rounded p-2 text-xs font-mono text-slate-600 whitespace-pre-wrap",children:n.flow})]})},n.name))}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-semibold mb-2",children:"Authorization URL Example"}),e.jsxs("div",{className:"relative group",children:[e.jsx("button",{onClick:()=>c("https://api.onepass.app/oauth/authorize?response_type=code&client_id=op_live_xxx&redirect_uri=https://yourapp.com/callback&scope=read:businesses+write:transactions&state=random_state","authurl"),className:"absolute top-2 right-2 p-1.5 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600",children:a==="authurl"?e.jsx(w,{className:"w-3.5 h-3.5"}):e.jsx(_,{className:"w-3.5 h-3.5"})}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto",children:e.jsx("code",{children:`https://api.onepass.app/oauth/authorize
  ?response_type=code
  &client_id=op_live_xxx
  &redirect_uri=https://yourapp.com/callback
  &scope=read:businesses+write:transactions
  &state=random_state`})})]})]})]})]}),e.jsxs(m,{children:[e.jsx(g,{children:e.jsx(b,{className:"text-base",children:"API Scopes"})}),e.jsx(p,{children:e.jsx("div",{className:"grid md:grid-cols-2 gap-2",children:is.map(n=>e.jsxs("div",{className:"flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50",children:[e.jsx("code",{className:"text-xs font-mono text-indigo-600",children:n.scope}),e.jsx("span",{className:"text-xs text-muted-foreground ml-auto",children:n.description}),e.jsx(x,{variant:n.level==="Write"?"default":"secondary",className:"text-xs",children:n.level})]},n.scope))})})]})]}),e.jsx(G,{value:"apikeys",className:"space-y-4",children:e.jsxs(m,{children:[e.jsx(g,{children:e.jsx(b,{className:"text-base",children:"API Key Management"})}),e.jsxs(p,{className:"space-y-4",children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"API keys are used for server-to-server authentication. Keys are prefixed by environment:"}),e.jsxs("div",{className:"grid md:grid-cols-2 gap-3",children:[e.jsxs("div",{className:"p-4 rounded-lg border border-amber-200 bg-amber-50",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx(x,{className:"bg-amber-500 text-white",children:"Sandbox"}),e.jsx("code",{className:"text-xs font-mono text-amber-700",children:"op_test_..."})]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Use sandbox keys for development and testing. No real transactions are processed."})]}),e.jsxs("div",{className:"p-4 rounded-lg border border-emerald-200 bg-emerald-50",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx(x,{className:"bg-emerald-600 text-white",children:"Production"}),e.jsx("code",{className:"text-xs font-mono text-emerald-700",children:"op_live_..."})]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Production keys process real transactions. Keep your secret secure and never expose it in client-side code."})]})]}),e.jsxs("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2",children:[e.jsx(Re,{className:"w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"}),e.jsxs("p",{className:"text-xs text-blue-800",children:["Your API secret is shown ",e.jsx("strong",{children:"only once"})," at creation. Store it securely — it cannot be retrieved later. Regenerate a key if the secret is compromised."]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-semibold mb-2",children:"Using API Keys"}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto",children:e.jsx("code",{children:`# Via HTTP header
curl -H "Authorization: Bearer op_live_xxx" \\
     -H "X-API-Secret: your_secret" \\
     https://api.onepass.app/v1/businesses

# Via SDK
const client = new OnePass({
  apiKey: 'op_live_xxx',
  apiSecret: 'your_secret'
});`})})]})]})]})}),e.jsx(G,{value:"jwt",className:"space-y-4",children:e.jsxs(m,{children:[e.jsx(g,{children:e.jsx(b,{className:"text-base",children:"JWT Access Tokens"})}),e.jsxs(p,{className:"space-y-4",children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"OnePass issues JSON Web Tokens (JWT) for stateless authentication. Tokens are signed with HS256 and expire after 24 hours."}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-semibold mb-2",children:"Token Structure"}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto",children:e.jsx("code",{children:`// JWT Header
{ "alg": "HS256", "typ": "JWT" }

// JWT Payload
{
  "sub": "user_6a529...",
  "email": "user@example.com",
  "role": "user",
  "scopes": ["read:businesses", "write:transactions"],
  "iat": 1720000000,
  "exp": 1720086400  // 24h expiry
}`})})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-semibold mb-2",children:"Using JWT Tokens"}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto",children:e.jsx("code",{children:`// Include in Authorization header
fetch('https://api.onepass.app/v1/profile', {
  headers: {
    'Authorization': 'Bearer ' + jwtToken
  }
});

// Token refresh
const { access_token } = await fetch('/oauth/token', {
  method: 'POST',
  body: JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: storedRefreshToken
  })
});`})})]}),e.jsxs("div",{className:"bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2",children:[e.jsx(F,{className:"w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0"}),e.jsx("p",{className:"text-xs text-amber-800",children:"JWTs are stateless — revocation requires checking a blocklist. For high-security applications, use short-lived tokens (1 hour) with refresh token rotation."})]})]})]})}),e.jsxs(G,{value:"ratelimit",className:"space-y-4",children:[e.jsxs(m,{children:[e.jsx(g,{children:e.jsx(b,{className:"text-base",children:"Rate Limiting"})}),e.jsxs(p,{className:"space-y-4",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["API requests are rate-limited per API key. Limits reset every minute. When exceeded, a ",e.jsx("code",{className:"text-xs font-mono bg-muted px-1 py-0.5 rounded",children:"429 Too Many Requests"})," response is returned."]}),e.jsx("div",{className:"grid md:grid-cols-2 gap-3",children:ns.map(n=>e.jsx(m,{children:e.jsxs(p,{className:"p-4",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx($,{className:"w-4 h-4 text-amber-500"}),e.jsx("p",{className:"font-semibold text-sm",children:n.tier})]}),e.jsxs("div",{className:"flex items-center gap-3 text-xs mb-2",children:[e.jsx(x,{variant:"secondary",children:n.limit}),e.jsxs(x,{variant:"outline",children:["Burst: ",n.burst]})]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:n.description})]})},n.tier))}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-semibold mb-2",children:"Rate Limit Response Headers"}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto",children:e.jsx("code",{children:`X-RateLimit-Limit: 500
X-RateLimit-Remaining: 437
X-RateLimit-Reset: 1720000060

// When rate limited (429):
{
  "error": "Rate limit exceeded",
  "retry_after": 60,
  "limit": 500,
  "remaining": 0
}`})})]})]})]}),e.jsxs(m,{children:[e.jsx(g,{children:e.jsxs(b,{className:"text-base flex items-center gap-2",children:[e.jsx(ge,{className:"w-4 h-4 text-indigo-600"})," IP Restrictions (Optional)"]})}),e.jsxs(p,{children:[e.jsx("p",{className:"text-sm text-muted-foreground mb-3",children:"Restrict API access to specific IP addresses for enhanced security. Configure an IP allowlist per application in the Developer Dashboard."}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto",children:e.jsx("code",{children:`// Configure IP whitelist
{
  "ip_whitelist": ["192.168.1.100", "10.0.0.0/24"]
}

// Requests from non-whitelisted IPs receive:
{
  "error": "IP address not allowed",
  "your_ip": "203.0.113.50"
}`})})]})]})]})]})}function cs({sdk:a}){const[l,c]=d.useState(a.language),[n,o]=d.useState(!1),u=v=>{navigator.clipboard.writeText(v),o(!0),setTimeout(()=>o(!1),2e3)};return e.jsxs(m,{className:"overflow-hidden",children:[e.jsxs(g,{className:"pb-3",children:[e.jsxs(b,{className:"flex items-center gap-2 text-base",children:[e.jsx("span",{className:"text-2xl",children:a.icon}),e.jsx("span",{children:a.name}),e.jsx(x,{variant:"secondary",className:"ml-auto text-xs",children:a.language})]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:a.description})]}),e.jsxs(p,{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsxs("p",{className:"text-xs font-semibold mb-1 flex items-center gap-1",children:[e.jsx(Qe,{className:"w-3 h-3"})," Installation"]}),e.jsxs("div",{className:"relative group",children:[e.jsx("button",{onClick:()=>u(a.install),className:"absolute top-2 right-2 p-1.5 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity",children:n?e.jsx(w,{className:"w-3.5 h-3.5"}):e.jsx(_,{className:"w-3.5 h-3.5"})}),e.jsx("pre",{className:"bg-slate-900 text-emerald-400 rounded-lg p-3 text-xs font-mono overflow-x-auto",children:e.jsxs("code",{children:["$ ",a.install]})})]})]}),e.jsxs("div",{children:[e.jsxs("p",{className:"text-xs font-semibold mb-1 flex items-center gap-1",children:[e.jsx(je,{className:"w-3 h-3"})," Quick Start"]}),e.jsxs("div",{className:"relative group",children:[e.jsx("button",{onClick:()=>u(a.code),className:"absolute top-2 right-2 p-1.5 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity",children:n?e.jsx(w,{className:"w-3.5 h-3.5"}):e.jsx(_,{className:"w-3.5 h-3.5"})}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-80",children:e.jsx("code",{children:a.code})})]})]})]})]})}function ds(){return e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"text-center mb-6",children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Official SDKs"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Type-safe SDKs for every major platform — install, initialize, and start integrating in minutes."})]}),e.jsx("div",{className:"grid md:grid-cols-2 gap-4",children:Ye.map(a=>e.jsx(cs,{sdk:a},a.name))}),e.jsx(m,{children:e.jsxs(p,{className:"p-4",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx(x,{variant:"outline",children:"cURL"}),e.jsx("span",{className:"text-sm font-medium",children:"No SDK? Use raw HTTP or cURL"})]}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto",children:e.jsx("code",{children:`# Authentication
TOKEN=$(curl -s -X POST https://api.onepass.app/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"grant_type":"client_credentials","client_id":"op_live_xxx","client_secret":"xxx"}' \\
  | jq -r '.access_token')

# Search businesses
curl -s https://api.onepass.app/v1/businesses/search \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"city":"Berlin","category":"restaurants","limit":10}' | jq`})})]})})]})}function ls(){const[a,l]=d.useState(""),[c,n]=d.useState(null),[o,u]=d.useState(!1),v=(r,y)=>{navigator.clipboard.writeText(r),l(y),setTimeout(()=>l(""),2e3)},i=async()=>{var r,y;u(!0),n(null);try{const h=JSON.stringify({event:"test.event",timestamp:new Date().toISOString(),data:{test:!0,message:"Test webhook event from OnePass Developer Portal."}}),A=Date.now();await k.entities.WebhookLog.create({app_id:"dev-portal",app_name:"Developer Portal",event_type:"test.event",url:"https://webhook.example.com/test",method:"POST",payload:h,response_status:200,response_body:'{"received": true}',status:"delivered",duration_ms:Date.now()-A,is_test:!0}),n({delivered:!0,statusCode:200,duration:Date.now()-A,response:'{"received": true, "test": true}'})}catch(h){n({delivered:!1,statusCode:0,duration:0,response:((y=(r=h==null?void 0:h.response)==null?void 0:r.data)==null?void 0:y.error)||(h==null?void 0:h.message)||"Failed to send test event. Admin access required."})}finally{u(!1)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs(m,{children:[e.jsx(g,{children:e.jsxs(b,{className:"text-base flex items-center gap-2",children:[e.jsx(M,{className:"w-5 h-5 text-indigo-600"})," Webhook Overview"]})}),e.jsxs(p,{className:"space-y-4",children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"OnePass delivers real-time event notifications to your webhook endpoint via HTTP POST. Each delivery includes an HMAC-SHA256 signature for verification."}),e.jsxs("div",{className:"grid md:grid-cols-3 gap-3",children:[e.jsxs("div",{className:"p-3 rounded-lg border border-border text-center",children:[e.jsx(Y,{className:"w-5 h-5 mx-auto text-amber-500 mb-1"}),e.jsx("p",{className:"text-xs font-semibold",children:"Retry Policy"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"5 retries with exponential backoff (1m, 5m, 30m, 2h, 6h)"})]}),e.jsxs("div",{className:"p-3 rounded-lg border border-border text-center",children:[e.jsx(O,{className:"w-5 h-5 mx-auto text-emerald-500 mb-1"}),e.jsx("p",{className:"text-xs font-semibold",children:"HMAC Signatures"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"SHA-256 signed payloads via X-OnePass-Signature header"})]}),e.jsxs("div",{className:"p-3 rounded-lg border border-border text-center",children:[e.jsx(z,{className:"w-5 h-5 mx-auto text-blue-500 mb-1"}),e.jsx("p",{className:"text-xs font-semibold",children:"Automatic Retry"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Failed deliveries auto-retry for up to 24 hours"})]})]})]})]}),e.jsxs(m,{children:[e.jsx(g,{children:e.jsx(b,{className:"text-base",children:"Webhook Signature Verification"})}),e.jsxs(p,{className:"space-y-3",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Every webhook includes an ",e.jsx("code",{className:"text-xs font-mono bg-muted px-1 rounded",children:"X-OnePass-Signature"})," header containing an HMAC-SHA256 signature of the raw request body, keyed with your webhook secret."]}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center justify-between mb-1",children:[e.jsx("p",{className:"text-xs font-semibold",children:"JavaScript / Node.js"}),e.jsx("button",{onClick:()=>v(`import crypto from 'crypto';

const expected = crypto
  .createHmac('sha256', process.env.ONEPASS_WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');

if (signature !== expected) {
  return res.status(401).json({ error: 'Invalid signature' });
}`,"js"),className:"p-1 rounded hover:bg-muted",children:a==="js"?e.jsx(w,{className:"w-3.5 h-3.5 text-emerald-500"}):e.jsx(_,{className:"w-3.5 h-3.5"})})]}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto",children:e.jsx("code",{children:`import crypto from 'crypto';

const expected = crypto
  .createHmac('sha256', process.env.ONEPASS_WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');

if (signature !== expected) {
  return res.status(401).json({ error: 'Invalid signature' });
}`})})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center justify-between mb-1",children:[e.jsx("p",{className:"text-xs font-semibold",children:"Python / Flask"}),e.jsx("button",{onClick:()=>v(`import hmac, hashlib

expected = hmac.new(
    os.environ['ONEPASS_WEBHOOK_SECRET'].encode(),
    raw_body,
    hashlib.sha256
).hexdigest()

if not hmac.compare_digest(signature, expected):
    return jsonify({'error': 'Invalid signature'}), 401`,"py"),className:"p-1 rounded hover:bg-muted",children:a==="py"?e.jsx(w,{className:"w-3.5 h-3.5 text-emerald-500"}):e.jsx(_,{className:"w-3.5 h-3.5"})})]}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto",children:e.jsx("code",{children:`import hmac, hashlib

expected = hmac.new(
    os.environ['ONEPASS_WEBHOOK_SECRET'].encode(),
    raw_body,
    hashlib.sha256
).hexdigest()

if not hmac.compare_digest(signature, expected):
    return jsonify({'error': 'Invalid signature'}), 401`})})]})]})]}),e.jsxs(m,{children:[e.jsx(g,{children:e.jsxs(b,{className:"text-base flex items-center gap-2",children:[e.jsx(Q,{className:"w-5 h-5 text-amber-500"})," Webhook Testing"]})}),e.jsxs(p,{className:"space-y-3",children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"Send a test event to your webhook endpoint from the Developer Dashboard. View delivery logs, response codes, and retry history."}),e.jsx("div",{className:"flex items-center gap-3",children:e.jsxs(N,{onClick:i,disabled:o,children:[o?e.jsx(z,{className:"w-4 h-4 animate-spin"}):e.jsx(Q,{className:"w-4 h-4"}),o?"Sending test...":"Send Test Event"]})}),c&&e.jsxs("div",{className:"p-3 rounded-lg border border-border bg-muted/30",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[c.delivered?e.jsx(O,{className:"w-4 h-4 text-emerald-500"}):e.jsx(ye,{className:"w-4 h-4 text-red-500"}),e.jsx("span",{className:"text-sm font-medium",children:c.delivered?"Delivery successful":"Delivery failed"}),e.jsx(x,{variant:"secondary",className:"ml-auto",children:c.statusCode}),e.jsxs(x,{variant:"outline",children:[c.duration,"ms"]})]}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded p-2 text-xs font-mono overflow-x-auto",children:e.jsx("code",{children:c.response})}),e.jsxs("p",{className:"text-[11px] text-muted-foreground mt-2",children:["Test events are logged with ",e.jsx("code",{className:"font-mono bg-muted px-1 rounded",children:"is_test=true"})," and appear in delivery logs."]})]})]})]}),e.jsxs(m,{children:[e.jsx(g,{children:e.jsx(b,{className:"text-base",children:"Webhook Event Catalog"})}),e.jsx(p,{children:e.jsx("div",{className:"grid gap-3",children:Ve.map(r=>e.jsxs("div",{className:"border border-border rounded-lg p-3",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsx("code",{className:"text-sm font-mono text-indigo-600",children:r.event}),e.jsx("button",{onClick:()=>v(r.payload,r.event),className:"ml-auto p-1 rounded hover:bg-muted",children:a===r.event?e.jsx(w,{className:"w-3.5 h-3.5 text-emerald-500"}):e.jsx(_,{className:"w-3.5 h-3.5"})})]}),e.jsx("p",{className:"text-xs text-muted-foreground mb-2",children:r.description}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded p-2 text-xs font-mono overflow-x-auto max-h-40",children:e.jsx("code",{children:r.payload})})]},r.event))})})]}),e.jsxs(m,{children:[e.jsx(g,{children:e.jsx(b,{className:"text-base",children:"Retry Policy & Delivery Status"})}),e.jsx(p,{children:e.jsxs("div",{className:"space-y-2",children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"If your endpoint returns a non-2xx status code or fails to respond within 10 seconds, OnePass will retry delivery with exponential backoff:"}),e.jsx("div",{className:"grid grid-cols-5 gap-2 text-center",children:[{attempt:1,delay:"Immediate"},{attempt:2,delay:"1 min"},{attempt:3,delay:"5 min"},{attempt:4,delay:"30 min"},{attempt:5,delay:"2 hours"}].map(r=>e.jsxs("div",{className:"p-2 rounded-lg border border-border",children:[e.jsxs("p",{className:"text-xs font-semibold",children:["Attempt ",r.attempt]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:r.delay})]},r.attempt))}),e.jsxs("p",{className:"text-xs text-muted-foreground mt-2",children:["After 5 failed attempts, the webhook is marked as ",e.jsx(x,{variant:"destructive",className:"text-xs",children:"failed"})," and the app owner is notified."]})]})})]})]})}function ms(){var R,I,B,E,f,C;const[a,l]=d.useState(!0),[c,n]=d.useState(null),[o,u]=d.useState(null),[v,i]=d.useState(!1),[r,y]=d.useState(""),[h,A]=d.useState({business_id:"",original_amount:50});d.useEffect(()=>{k.functions.invoke("developerPortalApi",{action:"getSandboxData"}).then(s=>n(s.data)).catch(()=>{}).finally(()=>l(!1))},[]);const T=async()=>{if(h.business_id){i(!0),u(null);try{const s=await k.functions.invoke("developerPortalApi",{action:"sandboxRedeemQr",business_id:h.business_id,original_amount:Number(h.original_amount)});u(s.data)}catch(s){u({error:s.message})}i(!1)}},D=(s,q)=>{navigator.clipboard.writeText(s),y(q),setTimeout(()=>y(""),2e3)};return e.jsxs("div",{className:"space-y-6",children:[e.jsx(m,{className:"border-amber-200 bg-gradient-to-br from-amber-50 to-white",children:e.jsxs(p,{className:"p-4 flex items-center gap-4",children:[e.jsx("div",{className:"rounded-xl bg-amber-100 p-3",children:e.jsx(ve,{className:"w-6 h-6 text-amber-600"})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"font-semibold flex items-center gap-2",children:["Sandbox Environment ",e.jsx(x,{className:"bg-amber-500 text-white",children:"Test Mode"})]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Test your integration without processing real transactions. Sandbox data is isolated from production."})]})]})}),e.jsxs(m,{children:[e.jsx(g,{children:e.jsxs(b,{className:"text-base flex items-center gap-2",children:[e.jsx(Ee,{className:"w-5 h-5 text-indigo-600"})," Sample Test Accounts"]})}),e.jsx(p,{children:a?e.jsx("div",{className:"space-y-2",children:[1,2,3].map(s=>e.jsx("div",{className:"h-16 bg-muted animate-pulse rounded-lg"},s))}):e.jsx("div",{className:"grid gap-3",children:(R=c==null?void 0:c.sampleAccounts)==null?void 0:R.map(s=>e.jsxs("div",{className:"flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("code",{className:"text-sm font-mono text-indigo-600",children:s.email}),e.jsx("button",{onClick:()=>D(`${s.email} / ${s.password}`,s.email),className:"p-1 rounded hover:bg-muted",children:r===s.email?e.jsx(w,{className:"w-3.5 h-3.5 text-emerald-500"}):e.jsx(_,{className:"w-3.5 h-3.5"})})]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:["Password: ",e.jsx("code",{className:"font-mono",children:s.password})]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx(x,{variant:"secondary",children:s.type}),e.jsx("p",{className:"text-xs text-muted-foreground mt-1",children:s.plan})]})]},s.email))})})]}),e.jsxs(m,{children:[e.jsx(g,{children:e.jsxs(b,{className:"text-base flex items-center gap-2",children:[e.jsx(qe,{className:"w-5 h-5 text-emerald-600"})," Sample Business Data"]})}),e.jsx(p,{children:a?e.jsx("div",{className:"grid md:grid-cols-2 gap-3",children:[1,2,3,4].map(s=>e.jsx("div",{className:"h-20 bg-muted animate-pulse rounded-lg"},s))}):e.jsx("div",{className:"grid md:grid-cols-2 gap-3",children:(I=c==null?void 0:c.businesses)==null?void 0:I.slice(0,6).map(s=>e.jsxs("div",{className:"p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer",onClick:()=>A({...h,business_id:s.id}),children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("p",{className:"font-medium text-sm",children:s.name}),h.business_id===s.id&&e.jsx(O,{className:"w-4 h-4 text-emerald-500"})]}),e.jsxs("div",{className:"flex items-center gap-2 mt-1",children:[e.jsx(x,{variant:"secondary",className:"text-xs",children:s.category}),e.jsxs(x,{variant:"outline",className:"text-xs",children:[s.discount_percentage,"% off"]})]}),e.jsxs("p",{className:"text-xs text-muted-foreground mt-1",children:[s.city,", ",s.country]})]},s.id))})})]}),e.jsxs(m,{children:[e.jsx(g,{children:e.jsxs(b,{className:"text-base flex items-center gap-2",children:[e.jsx(te,{className:"w-5 h-5 text-indigo-600"})," Mock QR Redemption"]})}),e.jsxs(p,{className:"space-y-4",children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"Simulate a QR code redemption flow. Select a business, enter an amount, and see the discount calculation — no real transaction is recorded."}),e.jsxs("div",{className:"grid md:grid-cols-2 gap-3",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(S,{children:"Business"}),e.jsx(X,{value:h.business_id,onValueChange:s=>A({...h,business_id:s}),placeholder:"Select a business",items:((B=c==null?void 0:c.businesses)==null?void 0:B.map(s=>({value:s.id,label:`${s.name} (${s.discount_percentage}% off)`})))||[]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(S,{children:"Original Amount (€)"}),e.jsx(P,{type:"number",value:h.original_amount,onChange:s=>A({...h,original_amount:s.target.value}),min:1,step:.01})]})]}),e.jsxs(N,{onClick:T,disabled:!h.business_id||v,children:[v?e.jsx(Q,{className:"w-4 h-4 animate-pulse"}):e.jsx(te,{className:"w-4 h-4"}),v?"Processing...":"Simulate Redemption"]}),o&&!o.error&&e.jsxs("div",{className:"p-4 rounded-lg border border-emerald-200 bg-emerald-50",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[e.jsx(O,{className:"w-5 h-5 text-emerald-600"}),e.jsx("span",{className:"font-semibold text-sm",children:"Redemption Approved (Sandbox)"}),e.jsx(x,{className:"bg-amber-500 text-white ml-auto",children:"Test Mode"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2 text-sm",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground",children:"Business:"})," ",o.business_name]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground",children:"Discount:"})," ",o.discount_percentage,"%"]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground",children:"Original:"})," €",(E=o.original_amount)==null?void 0:E.toFixed(2)]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground",children:"Discount Amount:"})," ",e.jsxs("span",{className:"text-emerald-600 font-semibold",children:["-€",(f=o.discount_amount)==null?void 0:f.toFixed(2)]})]}),e.jsxs("div",{className:"col-span-2 pt-2 border-t border-emerald-200",children:[e.jsx("span",{className:"text-muted-foreground",children:"Final Amount:"})," ",e.jsxs("span",{className:"text-lg font-bold text-emerald-700",children:["€",(C=o.final_amount)==null?void 0:C.toFixed(2)]})]})]}),e.jsxs("div",{className:"mt-2 pt-2 border-t border-emerald-200",children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:o.message}),e.jsxs("code",{className:"text-xs font-mono text-slate-500 mt-1 block",children:["QR Token: ",o.qr_token]})]})]}),(o==null?void 0:o.error)&&e.jsx("div",{className:"p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700",children:o.error})]})]})]})}const ps={curl:"cURL",javascript:"JavaScript",python:"Python",dart:"Dart"};function us({example:a}){const[l,c]=d.useState("javascript"),[n,o]=d.useState(!1),u=a.languages[l]||a.languages.javascript,v=Object.keys(a.languages),i=()=>{navigator.clipboard.writeText(u),o(!0),setTimeout(()=>o(!1),2e3)};return e.jsxs(m,{className:"overflow-hidden",children:[e.jsxs(g,{className:"pb-3",children:[e.jsxs(b,{className:"text-base flex items-center gap-2",children:[e.jsx("span",{className:"text-xl",children:a.icon}),a.title]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:a.description})]}),e.jsxs(p,{children:[e.jsxs("div",{className:"flex items-center gap-1 mb-2",children:[v.map(r=>e.jsx("button",{onClick:()=>c(r),className:`px-2.5 py-1 rounded text-xs font-medium transition-colors ${l===r?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-muted/70"}`,children:ps[r]||r},r)),e.jsx("button",{onClick:i,className:"ml-auto p-1.5 rounded-md hover:bg-muted",children:n?e.jsx(w,{className:"w-3.5 h-3.5 text-emerald-500"}):e.jsx(_,{className:"w-3.5 h-3.5"})})]}),e.jsx("pre",{className:"bg-slate-900 text-slate-100 rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-96",children:e.jsx("code",{children:u})})]})]})}function xs(){return e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"text-center mb-4",children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Code Examples"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Copy-paste examples in cURL, JavaScript, Python, and Dart for common integration scenarios."})]}),e.jsx("div",{className:"grid gap-4",children:Ze.map(a=>e.jsx(us,{example:a},a.title))})]})}function hs(){const[a,l]=d.useState([]),[c,n]=d.useState(!0),[o,u]=d.useState(null),[v,i]=d.useState(null),[r,y]=d.useState([]),[h,A]=d.useState(null),[T,D]=d.useState({}),[R,I]=d.useState(""),[B,E]=d.useState(!1),[f,C]=d.useState({name:"",description:"",app_type:"sandbox",scopes:"read:businesses",webhook_url:"",webhook_events:"",redirect_uri:""}),[s,q]=d.useState(null),L=async()=>{var t;n(!0);try{const[j,H,ke]=await Promise.all([k.functions.invoke("developerPortalApi",{action:"listMyApps"}),k.functions.invoke("developerPortalApi",{action:"getDashboardStats"}),k.functions.invoke("developerPortalApi",{action:"getUsageAnalytics"})]);l(j.data.apps||[]),u(H.data),i(ke.data),((t=j.data.apps)==null?void 0:t.length)>0&&(U(j.data.apps[0].id),A(j.data.apps[0].id))}catch{}n(!1)},U=async t=>{A(t);try{const j=await k.functions.invoke("developerPortalApi",{action:"listWebhookLogs",app_id:t});y(j.data.logs||[])}catch{y([])}};d.useEffect(()=>{L()},[]);const Ne=async()=>{try{const t=await k.functions.invoke("developerPortalApi",{action:"registerApp",...f});q({api_key:t.data.api_key,api_secret:t.data.api_secret,webhook_secret:t.data.webhook_secret}),E(!1),L()}catch{}},we=async t=>{if(confirm("Regenerate API key? The old key will stop working immediately."))try{const j=await k.functions.invoke("developerPortalApi",{action:"regenerateKey",app_id:t});q({api_key:j.data.api_key,api_secret:j.data.api_secret,regenerate:!0}),L()}catch{}},_e=async t=>{if(confirm("Delete this application? This cannot be undone."))try{await k.functions.invoke("developerPortalApi",{action:"deleteApp",app_id:t}),L()}catch{}},Se=async t=>{try{await k.functions.invoke("developerPortalApi",{action:"testWebhook",app_id:t}),U(t)}catch{}},K=(t,j)=>{navigator.clipboard.writeText(t),I(j),setTimeout(()=>I(""),2e3)};return c?e.jsx("div",{className:"flex justify-center py-12",children:e.jsx("div",{className:"w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"})}):e.jsxs("div",{className:"space-y-6",children:[o&&e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-3",children:[{label:"Total Apps",value:o.totalApps,icon:ce,color:"text-indigo-600 bg-indigo-50"},{label:"Active Apps",value:o.activeApps,icon:O,color:"text-emerald-600 bg-emerald-50"},{label:"Total Requests",value:o.totalRequests,icon:Be,color:"text-blue-600 bg-blue-50"},{label:"Webhooks Sent",value:o.totalWebhooks,icon:M,color:"text-amber-600 bg-amber-50"}].map(t=>e.jsx(m,{children:e.jsxs(p,{className:"p-3 flex items-center gap-3",children:[e.jsx("div",{className:`rounded-lg p-2 ${t.color}`,children:e.jsx(t.icon,{className:"w-4 h-4"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xl font-bold",children:t.value}),e.jsx("p",{className:"text-xs text-muted-foreground",children:t.label})]})]})},t.label))}),v&&e.jsxs(m,{children:[e.jsx(g,{children:e.jsxs(b,{className:"text-base flex items-center gap-2",children:[e.jsx(fe,{className:"w-5 h-5 text-indigo-600"})," API Usage (Last 30 Days)"]})}),e.jsx(p,{children:e.jsx(Le,{width:"100%",height:200,children:e.jsxs(Ge,{data:v.daily,children:[e.jsx(Fe,{strokeDasharray:"3 3",className:"opacity-30"}),e.jsx(Ke,{dataKey:"date",tick:{fontSize:10},interval:4}),e.jsx(He,{tick:{fontSize:10}}),e.jsx(We,{contentStyle:{fontSize:12,borderRadius:8}}),e.jsx(de,{dataKey:"requests",fill:"hsl(239 84% 67%)",radius:[4,4,0,0],name:"Requests"}),e.jsx(de,{dataKey:"errors",fill:"hsl(0 84% 60%)",radius:[4,4,0,0],name:"Errors"})]})})})]}),e.jsxs(m,{children:[e.jsxs(g,{children:[e.jsxs(b,{className:"text-base flex items-center gap-2",children:[e.jsx(V,{className:"w-5 h-5 text-indigo-600"})," Applications & API Keys"]}),e.jsxs(ae,{open:B,onOpenChange:E,children:[e.jsx(De,{asChild:!0,children:e.jsxs(N,{size:"sm",className:"ml-auto",children:[e.jsx(ce,{className:"w-4 h-4"})," Register App"]})}),e.jsxs(re,{className:"max-w-lg",children:[e.jsx(ie,{children:e.jsx(ne,{children:"Register New Application"})}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsx(S,{children:"Name"}),e.jsx(P,{value:f.name,onChange:t=>C({...f,name:t.target.value}),placeholder:"My OnePass Integration"})]}),e.jsxs("div",{children:[e.jsx(S,{children:"Description"}),e.jsx(Ie,{value:f.description,onChange:t=>C({...f,description:t.target.value}),placeholder:"What does this app do?",rows:2})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx(S,{children:"Environment"}),e.jsx(X,{value:f.app_type,onValueChange:t=>C({...f,app_type:t}),placeholder:"Select environment",items:[{value:"sandbox",label:"Sandbox (Test)"},{value:"production",label:"Production"}]})]}),e.jsxs("div",{children:[e.jsx(S,{children:"Rate Limit (req/min)"}),e.jsx(P,{type:"number",value:f.app_type==="production"?500:100,disabled:!0})]})]}),e.jsxs("div",{children:[e.jsx(S,{children:"Scopes (comma-separated)"}),e.jsx(P,{value:f.scopes,onChange:t=>C({...f,scopes:t.target.value}),placeholder:"read:businesses,write:transactions"})]}),e.jsxs("div",{children:[e.jsx(S,{children:"Webhook URL"}),e.jsx(P,{value:f.webhook_url,onChange:t=>C({...f,webhook_url:t.target.value}),placeholder:"https://yourapp.com/webhooks/onepass"})]}),e.jsxs("div",{children:[e.jsx(S,{children:"Redirect URI (OAuth)"}),e.jsx(P,{value:f.redirect_uri,onChange:t=>C({...f,redirect_uri:t.target.value}),placeholder:"https://yourapp.com/callback"})]})]}),e.jsxs(oe,{children:[e.jsx(N,{variant:"outline",onClick:()=>E(!1),children:"Cancel"}),e.jsx(N,{onClick:Ne,disabled:!f.name,children:"Create App"})]})]})]})]}),e.jsx(p,{children:a.length===0?e.jsx("p",{className:"text-sm text-muted-foreground text-center py-6",children:'No applications registered yet. Click "Register App" to create your first API key.'}):e.jsx("div",{className:"space-y-3",children:a.map(t=>{var j;return e.jsxs("div",{className:"border border-border rounded-lg p-3",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx("p",{className:"font-semibold text-sm",children:t.name}),e.jsx(x,{variant:t.app_type==="production"?"default":"secondary",className:"text-xs",children:t.app_type}),e.jsx(x,{variant:t.status==="active"?"default":"destructive",className:"text-xs",children:t.status}),e.jsxs("div",{className:"ml-auto flex gap-1",children:[e.jsx(N,{size:"icon",variant:"ghost",className:"h-7 w-7",onClick:()=>we(t.id),title:"Regenerate Key",children:e.jsx(z,{className:"w-3.5 h-3.5"})}),e.jsx(N,{size:"icon",variant:"ghost",className:"h-7 w-7",onClick:()=>_e(t.id),title:"Delete",children:e.jsx(Me,{className:"w-3.5 h-3.5 text-red-500"})})]})]}),t.description&&e.jsx("p",{className:"text-xs text-muted-foreground mb-2",children:t.description}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs font-medium w-16",children:"API Key:"}),e.jsx("code",{className:"text-xs font-mono text-slate-600 bg-muted px-2 py-0.5 rounded flex-1 truncate",children:t.api_key}),e.jsx("button",{onClick:()=>K(t.api_key,`key-${t.id}`),className:"p-1 rounded hover:bg-muted",children:R===`key-${t.id}`?e.jsx(w,{className:"w-3 h-3 text-emerald-500"}):e.jsx(_,{className:"w-3 h-3"})})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs font-medium w-16",children:"Webhook:"}),e.jsx("code",{className:"text-xs font-mono text-slate-600 bg-muted px-2 py-0.5 rounded flex-1 truncate",children:t.webhook_url||"Not configured"}),t.webhook_url&&e.jsx(N,{size:"sm",variant:"outline",className:"h-6 text-xs",onClick:()=>Se(t.id),children:"Test"})]})]}),e.jsx("div",{className:"flex flex-wrap gap-1 mt-2",children:(j=t.scopes)==null?void 0:j.split(",").map(H=>e.jsx(x,{variant:"outline",className:"text-xs font-mono",children:H.trim()},H))})]},t.id)})})})]}),e.jsx(ae,{open:!!s,onOpenChange:()=>q(null),children:e.jsxs(re,{children:[e.jsx(ie,{children:e.jsxs(ne,{className:"flex items-center gap-2",children:[s!=null&&s.regenerate?e.jsx(z,{className:"w-5 h-5 text-amber-500"}):e.jsx(O,{className:"w-5 h-5 text-emerald-500"}),s!=null&&s.regenerate?"API Key Regenerated":"App Created Successfully"]})}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"bg-amber-50 border border-amber-200 rounded-lg p-3",children:e.jsx("p",{className:"text-xs text-amber-800 font-medium",children:"⚠️ Save your API secret now — it will not be shown again."})}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{children:[e.jsx(S,{className:"text-xs",children:"API Key"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(P,{readOnly:!0,value:(s==null?void 0:s.api_key)||"",className:"font-mono text-xs"}),e.jsx(N,{size:"icon",onClick:()=>K(s==null?void 0:s.api_key,"newkey"),children:R==="newkey"?e.jsx(w,{className:"w-4 h-4"}):e.jsx(_,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{children:[e.jsx(S,{className:"text-xs",children:"API Secret"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(P,{readOnly:!0,type:T.secret?"text":"password",value:(s==null?void 0:s.api_secret)||"",className:"font-mono text-xs"}),e.jsx(N,{size:"icon",variant:"outline",onClick:()=>D({...T,secret:!T.secret}),children:T.secret?e.jsx(le,{className:"w-4 h-4"}):e.jsx(me,{className:"w-4 h-4"})}),e.jsx(N,{size:"icon",onClick:()=>K(s==null?void 0:s.api_secret,"newsecret"),children:R==="newsecret"?e.jsx(w,{className:"w-4 h-4"}):e.jsx(_,{className:"w-4 h-4"})})]})]}),(s==null?void 0:s.webhook_secret)&&e.jsxs("div",{children:[e.jsx(S,{className:"text-xs",children:"Webhook Secret"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(P,{readOnly:!0,type:T.wh?"text":"password",value:(s==null?void 0:s.webhook_secret)||"",className:"font-mono text-xs"}),e.jsx(N,{size:"icon",variant:"outline",onClick:()=>D({...T,wh:!T.wh}),children:T.wh?e.jsx(le,{className:"w-4 h-4"}):e.jsx(me,{className:"w-4 h-4"})}),e.jsx(N,{size:"icon",onClick:()=>K(s==null?void 0:s.webhook_secret,"newwh"),children:R==="newwh"?e.jsx(w,{className:"w-4 h-4"}):e.jsx(_,{className:"w-4 h-4"})})]})]})]})]}),e.jsx(oe,{children:e.jsx(N,{onClick:()=>q(null),children:"Done"})})]})}),e.jsxs(m,{children:[e.jsxs(g,{children:[e.jsxs(b,{className:"text-base flex items-center gap-2",children:[e.jsx(M,{className:"w-5 h-5 text-indigo-600"})," Webhook Delivery Logs"]}),a.length>0&&e.jsx(X,{value:h,onValueChange:U,placeholder:"Select app",items:a.map(t=>({value:t.id,label:t.name})),className:"ml-auto w-48"})]}),e.jsx(p,{children:r.length===0?e.jsx("p",{className:"text-sm text-muted-foreground text-center py-6",children:"No webhook deliveries yet. Configure a webhook URL and send a test event."}):e.jsx("div",{className:"space-y-2",children:r.map(t=>e.jsxs("div",{className:"flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-muted/30",children:[t.status==="delivered"?e.jsx(O,{className:"w-4 h-4 text-emerald-500"}):e.jsx(ye,{className:"w-4 h-4 text-red-500"}),e.jsx("code",{className:"text-xs font-mono text-indigo-600",children:t.event_type}),e.jsx(x,{variant:"outline",className:"text-xs",children:t.response_status||"—"}),e.jsxs("span",{className:"text-xs text-muted-foreground",children:[t.duration_ms,"ms"]}),t.is_test&&e.jsx(x,{variant:"secondary",className:"text-xs",children:"Test"}),e.jsxs("span",{className:"text-xs text-muted-foreground ml-auto",children:[e.jsx(Y,{className:"w-3 h-3 inline mr-1"}),new Date(t.created_date).toLocaleString()]})]},t.id))})})]})]})}function gs(){return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Platform Integrations"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Connect OnePass with your existing business tools — POS, CRM, ERP, accounting, and marketing platforms."})]}),es.map(a=>e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[e.jsx("span",{className:"text-xl",children:a.icon}),e.jsx("h4",{className:"font-semibold",children:a.category}),e.jsxs(x,{variant:"outline",className:"text-xs",children:[a.items.length," integrations"]})]}),e.jsx("div",{className:"grid md:grid-cols-2 lg:grid-cols-3 gap-3",children:a.items.map(l=>e.jsx(m,{className:"hover:shadow-md transition-shadow",children:e.jsxs(p,{className:"p-4",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx("div",{className:`rounded-lg p-1.5 ${a.color}`,children:e.jsx("span",{className:"text-sm font-bold",children:l.name[0]})}),e.jsx("p",{className:"font-semibold text-sm",children:l.name}),e.jsxs(x,{variant:l.status==="available"?"default":"secondary",className:"ml-auto text-xs",children:[l.status==="available"?e.jsx(O,{className:"w-3 h-3 mr-0.5"}):e.jsx(Y,{className:"w-3 h-3 mr-0.5"}),l.status==="available"?"Available":"Planned"]})]}),e.jsx("p",{className:"text-xs text-muted-foreground mb-2",children:l.description}),e.jsx("p",{className:"text-xs text-slate-500 bg-muted/50 rounded p-2",children:l.docs}),l.status==="available"&&e.jsxs(N,{variant:"outline",size:"sm",className:"w-full mt-3 text-xs",children:["Connect ",e.jsx(ze,{className:"w-3 h-3"})]})]})},l.name))})]},a.category)),e.jsxs(m,{children:[e.jsx(g,{children:e.jsx(b,{className:"text-base",children:"How Integrations Work"})}),e.jsx(p,{children:e.jsxs("div",{className:"grid md:grid-cols-3 gap-3",children:[e.jsxs("div",{className:"p-3 rounded-lg border border-border",children:[e.jsx("p",{className:"text-sm font-semibold mb-1",children:"1. Configure"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Connect your platform credentials in the Developer Dashboard. OnePass uses OAuth where supported."})]}),e.jsxs("div",{className:"p-3 rounded-lg border border-border",children:[e.jsx("p",{className:"text-sm font-semibold mb-1",children:"2. Map Data"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Map OnePass entities (businesses, members, transactions) to your platform's data model."})]}),e.jsxs("div",{className:"p-3 rounded-lg border border-border",children:[e.jsx("p",{className:"text-sm font-semibold mb-1",children:"3. Sync"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Real-time webhook events and scheduled sync keep both systems up to date automatically."})]})]})})]})]})}function yt(){const{t:a}=Te(),[l,c]=d.useState("docs"),n=()=>{switch(l){case"docs":return e.jsx(xe,{});case"auth":return e.jsx(os,{});case"sdks":return e.jsx(ds,{});case"webhooks":return e.jsx(ls,{});case"sandbox":return e.jsx(ms,{});case"examples":return e.jsx(xs,{});case"dashboard":return e.jsx(hs,{});case"integrations":return e.jsx(gs,{});default:return e.jsx(xe,{})}},o={docs:a("dev.tabs.apiDocs"),auth:a("dev.tabs.authSecurity"),sdks:a("dev.tabs.sdks"),webhooks:a("dev.tabs.webhooks"),sandbox:a("dev.tabs.sandbox"),examples:a("dev.tabs.codeExamples"),dashboard:a("dev.tabs.dashboard"),integrations:a("dev.tabs.integrations")};return e.jsxs("div",{className:"min-h-screen bg-gradient-to-b from-slate-50 to-white",children:[e.jsx(Ue,{title:"Developer Portal",fallbackTo:"/dashboard"}),e.jsx("div",{className:"relative overflow-hidden hero-gradient border-b border-border",children:e.jsxs("div",{className:"max-w-6xl mx-auto px-4 py-16 md:py-20 text-center",children:[e.jsxs(x,{variant:"secondary",className:"mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-100",children:[e.jsx(J,{className:"w-3 h-3 mr-1"})," ",a("dev.hero.badge")]}),e.jsx("h1",{className:"text-4xl md:text-5xl font-bold text-foreground mb-4",children:a("dev.hero.title")}),e.jsx("p",{className:"text-lg text-muted-foreground max-w-2xl mx-auto mb-8",children:a("dev.hero.subtitle")}),e.jsxs("div",{className:"flex flex-wrap justify-center gap-3",children:[e.jsxs(N,{onClick:()=>c("docs"),children:[e.jsx(Z,{className:"w-4 h-4"})," ",a("dev.hero.exploreApi")]}),e.jsxs(N,{variant:"outline",onClick:()=>c("dashboard"),children:[e.jsx(J,{className:"w-4 h-4"})," ",a("dev.hero.devDashboard")]})]})]})}),e.jsx("div",{className:"max-w-6xl mx-auto px-4 py-8",children:e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-3",children:ss.map(u=>e.jsx(m,{className:"hover:shadow-md transition-shadow",children:e.jsxs(p,{className:"p-3 flex items-center gap-3",children:[e.jsx("div",{className:"rounded-lg bg-indigo-50 p-2 flex-shrink-0",children:e.jsx(u.icon,{className:"w-4 h-4 text-indigo-600"})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("h3",{className:"font-semibold text-xs",children:u.title}),e.jsx("p",{className:"text-xs text-muted-foreground",children:u.desc})]})]})},u.title))})}),e.jsx("div",{className:"max-w-6xl mx-auto px-4 sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-y border-border",children:e.jsx("div",{className:"flex gap-1 overflow-x-auto py-2",children:ts.map(u=>e.jsxs("button",{onClick:()=>c(u.id),className:`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${l===u.id?"bg-primary text-primary-foreground":"text-muted-foreground hover:bg-muted hover:text-foreground"}`,children:[e.jsx(u.icon,{className:"w-4 h-4"}),o[u.id]||u.label]},u.id))})}),e.jsx("div",{className:"max-w-6xl mx-auto px-4 py-8",children:n()})]})}export{yt as default};
