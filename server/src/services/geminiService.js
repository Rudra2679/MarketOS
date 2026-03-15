const { GoogleGenerativeAI } = require('@google/generative-ai')

let genAI = null

// ── Lazy initialise Gemini client ────────────────────
const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in .env')
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

// ── Helper: get model instance ───────────────────────
const getModel = () =>
  getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' })

// ── Helper: safely parse JSON from Gemini ────────────
const parseJSON = (text, fallback) => {
  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return fallback
  }
}

// ── Generate campaign suggestions ────────────────────
const generateSuggestions = async ({
  companyName, product, targetAudience,
  campaignName, campaignDescription,
  goals, channels, budget,
}) => {
  const prompt = `
You are an expert marketing strategist.
Analyze this campaign and give 5 specific, actionable suggestions.

Company: ${companyName}
Product/Service: ${product}
Target Audience: ${targetAudience}
Campaign Name: ${campaignName || 'Not specified'}
Description: ${campaignDescription || 'Not specified'}
Goals: ${goals || 'Not specified'}
Channels: ${channels?.join(', ') || 'Not specified'}
Budget: ${budget ? '$' + budget : 'Not specified'}

Respond ONLY with valid JSON, no markdown:
{
  "suggestions": [
    {
      "title": "short title",
      "description": "2-3 sentence actionable detail",
      "impact": "high|medium|low",
      "category": "targeting|content|channel|budget|timing|engagement"
    }
  ],
  "overallScore": <1-10>,
  "summary": "one sentence overall assessment"
}`

  const result = await getModel().generateContent(prompt)
  const text   = result.response.text()

  return parseJSON(text, {
    suggestions: [{
      title:       'Analysis complete',
      description: text,
      impact:      'high',
      category:    'content',
    }],
    overallScore: 7,
    summary:      'Analysis generated successfully.',
  })
}

// ── Generate lead profiles ───────────────────────────
const generateLeads = async ({
  companyName, product, targetAudience,
  campaignName, channels,
}) => {
  const prompt = `
You are a lead generation expert.
Generate 5 ideal customer profiles (ICPs) with acquisition strategies.

Company: ${companyName}
Product/Service: ${product}
Target Audience: ${targetAudience}
Campaign: ${campaignName || 'General Campaign'}
Channels: ${channels?.join(', ') || 'Not specified'}

Respond ONLY with valid JSON, no markdown:
{
  "leads": [
    {
      "persona": "persona name/title",
      "demographics": "age, location, income",
      "painPoints": "key challenges they face",
      "acquisitionStrategy": "how to reach and convert (2-3 sentences)",
      "channel": "best channel to reach them",
      "conversionLikelihood": "high|medium|low"
    }
  ],
  "topStrategy": "single best overall lead gen strategy",
  "estimatedReach": "estimated total addressable market"
}`

  const result = await getModel().generateContent(prompt)
  const text   = result.response.text()

  return parseJSON(text, {
    leads: [{
      persona:               'Primary Lead',
      demographics:          'Generated profile',
      painPoints:            text,
      acquisitionStrategy:   'See full analysis above.',
      channel:               'multi-channel',
      conversionLikelihood:  'high',
    }],
    topStrategy:    'Multi-channel approach.',
    estimatedReach: 'Varies by market.',
  })
}

module.exports = { generateSuggestions, generateLeads }
