// OpenAI helper module for ANERIUM platform
// Powers: customer AI concierge, business AI insights, recommendations, chat

const OPENAI_API_KEY = process.env.OPENAI_PROJECT_KEY || process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

/**
 * Call OpenAI Chat Completions API
 * @param {Array} messages - [{role, content}]
 * @param {Object} options - { model, temperature, max_tokens, response_format }
 * @returns {Object} - { content, usage }
 */
export async function chatCompletion(messages, options = {}) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const body = {
    model: options.model || OPENAI_MODEL,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens || 1000,
  };

  if (options.response_format) {
    body.response_format = options.response_format;
  }

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('OpenAI API error:', response.status, err);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || '',
    usage: data.usage,
  };
}

/**
 * Generate a conversational AI response for the customer concierge
 */
export async function customerConciergeChat(message, context = {}) {
  const systemPrompt = `You are the ANERIUM OnePass AI Concierge — a friendly, knowledgeable assistant for the ANERIUM loyalty platform.

ANERIUM OnePass is a membership platform that gives customers 5%–20% discounts at thousands of participating businesses worldwide (restaurants, cafés, retail, beauty, fitness, entertainment, hotels, and more).

Your role:
- Help users discover businesses and offers
- Answer questions about membership plans and benefits
- Suggest personalized recommendations
- Help with trip planning and savings optimization
- Be warm, concise, and genuinely helpful

User context:
- Name: ${context.full_name || 'Member'}
- Membership: ${context.membership_type || 'free'}
- City: ${context.city || 'Not specified'}
- Country: ${context.country || 'Not specified'}

${context.favorites ? `Favorite categories: ${context.favorites}` : ''}
${context.loyalty_points != null ? `Loyalty points: ${context.loyalty_points}` : ''}

Keep responses under 200 words unless the user asks for detailed planning. Be conversational, not robotic. Use emojis sparingly.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(context.history || []).slice(-6).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    { role: 'user', content: message },
  ];

  return chatCompletion(messages, { temperature: 0.8, max_tokens: 500 });
}

/**
 * Generate personalized business recommendations
 */
export async function generateRecommendations(user, businesses, favorites) {
  const systemPrompt = `You are the ANERIUM recommendation engine. Given a user's profile and a list of available businesses, generate personalized recommendations.

Return a JSON object with:
{
  "recommendations": [
    { "business_id": "...", "reason": "1-2 sentence personalized reason" }
  ],
  "summary": "Brief personalized summary of why these were chosen"
}

Pick the top 5-8 most relevant businesses. Focus on variety, matching user interests, and highlighting savings opportunities.`;

  const businessList = businesses.slice(0, 50).map(b => ({
    id: b.id,
    name: b.name,
    category: b.category,
    description: b.description?.substring(0, 200),
    rating: b.rating,
  }));

  const userPrompt = `User: ${user.full_name || 'Member'}, Membership: ${user.membership_type || 'free'}, City: ${user.city || 'N/A'}
Favorite categories: ${favorites || 'None specified yet'}

Available businesses:
${JSON.stringify(businessList, null, 0)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await chatCompletion(messages, {
    temperature: 0.5,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { recommendations: [], summary: result.content };
  }
}

/**
 * Generate savings insights from transaction history
 */
export async function generateSavingsInsights(user, transactions) {
  const systemPrompt = `You are the ANERIUM savings insights engine. Analyze a user's transaction history and provide actionable savings insights.

Return a JSON object with:
{
  "total_saved": "estimated amount saved",
  "insights": [
    { "title": "...", "description": "...", "category": "...", "potential_savings": "..." }
  ],
  "recommendations": ["actionable tip 1", "actionable tip 2"],
  "summary": "2-3 sentence summary"
}

Focus on real savings opportunities, spending patterns, and membership optimization.`;

  const txList = transactions.map(t => ({
    business: t.business_name,
    amount: t.amount,
    discount: t.discount_amount,
    category: t.category,
    date: t.transaction_date,
  }));

  const userPrompt = `User: ${user.full_name || 'Member'}, Membership: ${user.membership_type || 'free'}
Transactions (last 20):
${JSON.stringify(txList, null, 0)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await chatCompletion(messages, {
    temperature: 0.3,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { insights: [], summary: result.content, recommendations: [] };
  }
}

/**
 * Plan a trip with ANERIUM discounts
 */
export async function planTrip(destination, duration, preferences, businesses) {
  const systemPrompt = `You are the ANERIUM trip planner. Help plan a trip using ANERIUM OnePass discounts at participating businesses.

Return a JSON object with:
{
  "itinerary": [
    {
      "day": 1,
      "activities": [
        { "time": "...", "business": "...", "activity": "...", "estimated_savings": "..." }
      ]
    }
  ],
  "total_estimated_savings": "...",
  "tips": ["tip 1", "tip 2"]
}

Be practical and match activities to the available businesses and user preferences.`;

  const userPrompt = `Trip: ${destination}, Duration: ${duration || '3 days'}
Preferences: ${preferences || 'General'}
Available ANERIUM businesses in the area:
${JSON.stringify(businesses.slice(0, 20).map(b => ({ name: b.name, category: b.category, description: b.description?.substring(0, 100) })), null, 0)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await chatCompletion(messages, {
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { itinerary: [], tips: [result.content] };
  }
}

/**
 * Generate membership advice
 */
export async function generateMembershipAdvice(user, plans, currentPlan) {
  const systemPrompt = `You are the ANERIUM membership advisor. Given a user's profile and available plans, recommend the best membership tier.

Return a JSON object with:
{
  "recommended_plan": "plan name",
  "reasoning": "2-3 sentences explaining why",
  "benefits": ["benefit 1", "benefit 2", "benefit 3"],
  "estimated_monthly_savings": "amount",
  "upgrade_url": "/pricing"
}`;

  const userPrompt = `User: ${user.full_name || 'Member'}, Current plan: ${currentPlan || 'free'}
Available plans:
${JSON.stringify(plans.map(p => ({ name: p.name, price: p.price, billing_cycle: p.billing_cycle, features: p.features })), null, 0)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await chatCompletion(messages, {
    temperature: 0.3,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { reasoning: result.content, recommended_plan: 'premium', benefits: [], upgrade_url: '/pricing' };
  }
}

/**
 * Generate business AI insights (for business portal)
 */
export async function generateBusinessInsights(business, metrics, reviews) {
  const systemPrompt = `You are the ANERIUM business analytics AI. Analyze a business's performance metrics and provide actionable insights.

Return a JSON object with:
{
  "insights": [
    { "title": "...", "description": "...", "priority": "high|medium|low", "category": "..." }
  ],
  "recommendations": ["action 1", "action 2"],
  "performance_summary": "2-3 sentences",
  "growth_opportunities": ["opportunity 1", "opportunity 2"]
}`;

  const userPrompt = `Business: ${business.name}, Category: ${business.category}
Metrics: ${JSON.stringify(metrics, null, 0)}
Recent reviews: ${JSON.stringify(reviews.slice(0, 5).map(r => ({ rating: r.rating, content: r.content?.substring(0, 100) })), null, 0)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await chatCompletion(messages, {
    temperature: 0.3,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { insights: [], recommendations: [], performance_summary: result.content };
  }
}

/**
 * Generate marketing campaign suggestions for a business
 */
export async function generateMarketingAssistant(business, customerData) {
  const systemPrompt = `You are the ANERIUM marketing AI assistant. Generate marketing campaign ideas for a business.

Return a JSON object with:
{
  "campaigns": [
    {
      "name": "...",
      "type": "email|social|push|in-app",
      "description": "...",
      "target_audience": "...",
      "estimated_reach": "...",
      "call_to_action": "..."
    }
  ],
  "content_suggestions": ["post idea 1", "post idea 2"],
  "tips": ["marketing tip 1", "marketing tip 2"]
}`;

  const userPrompt = `Business: ${business.name}, Category: ${business.category}
Customer data: ${JSON.stringify(customerData, null, 0)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await chatCompletion(messages, {
    temperature: 0.7,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { campaigns: [], content_suggestions: [], tips: [result.content] };
  }
}

/**
 * Answer business owner questions about their data
 */
export async function answerBusinessQuestion(question, business, metrics) {
  const systemPrompt = `You are the ANERIUM business intelligence AI. Answer the business owner's question based on their data.

Be concise, specific, and actionable. If the data doesn't contain the answer, say so and suggest what data would help.

Business: ${business.name}, Category: ${business.category}
Available metrics: ${JSON.stringify(metrics, null, 0)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question },
  ];

  const result = await chatCompletion(messages, {
    temperature: 0.4,
    max_tokens: 500,
  });

  return { answer: result.content };
}

/**
 * Generate a weekly summary for a business
 */
export async function generateWeeklySummary(business, weeklyMetrics) {
  const systemPrompt = `You are the ANERIUM weekly report generator. Create a concise weekly summary for a business owner.

Return a JSON object with:
{
  "headline": "1-sentence summary",
  "highlights": ["highlight 1", "highlight 2"],
  "areas_of_concern": ["concern 1"],
  "action_items": ["action 1", "action 2"],
  "metrics_overview": { "revenue": "...", "customers": "...", "avg_rating": "..." }
}`;

  const userPrompt = `Business: ${business.name}
Weekly metrics: ${JSON.stringify(weeklyMetrics, null, 0)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await chatCompletion(messages, {
    temperature: 0.3,
    max_tokens: 600,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { headline: result.content, highlights: [], action_items: [] };
  }
}

/**
 * Generate operations insights for a business
 */
export async function generateOperationsInsights(business, opsData) {
  const systemPrompt = `You are the ANERIUM operations AI. Analyze operational data and provide insights.

Return a JSON object with:
{
  "insights": [{ "title": "...", "description": "...", "priority": "high|medium|low" }],
  "efficiency_score": "0-100",
  "bottlenecks": ["issue 1"],
  "recommendations": ["action 1", "action 2"]
}`;

  const userPrompt = `Business: ${business.name}, Category: ${business.category}
Operations data: ${JSON.stringify(opsData, null, 0)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await chatCompletion(messages, {
    temperature: 0.3,
    max_tokens: 600,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { insights: [], recommendations: [result.content] };
  }
}

/**
 * Generate a business score advisory
 */
export async function generateScoreAdvisor(business, score, scoreBreakdown) {
  const systemPrompt = `You are the ANERIUM business score advisor. Explain a business's score and suggest improvements.

Return a JSON object with:
{
  "overall_score": number,
  "interpretation": "what the score means",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1"],
  "improvement_plan": [{ "area": "...", "action": "...", "expected_impact": "..." }]
}`;

  const userPrompt = `Business: ${business.name}
Current score: ${score}
Score breakdown: ${JSON.stringify(scoreBreakdown, null, 0)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await chatCompletion(messages, {
    temperature: 0.3,
    max_tokens: 600,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { interpretation: result.content, improvement_plan: [] };
  }
}

export { OPENAI_API_KEY, OPENAI_MODEL };
