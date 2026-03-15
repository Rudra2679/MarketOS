const express = require('express');
const { protect } = require('../middleware/auth');
const { generateSuggestions, generateLeads } = require('../services/geminiService');
const Campaign = require('../models/Campaign');

const router = express.Router();

// POST /api/ai/suggestions
router.post('/suggestions', protect, async (req, res) => {
  try {
    const { campaignId, campaignName, campaignDescription, goals, channels, budget } = req.body;

    const context = {
      companyName:         req.company.companyName,
      product:             req.company.product,
      targetAudience:      req.company.targetAudience,
      campaignName,
      campaignDescription,
      goals,
      channels,
      budget,
    };

    const result = await generateSuggestions(context);

    if (campaignId) {
      await Campaign.findOneAndUpdate(
        { _id: campaignId, company: req.company._id },
        { $push: { aiSuggestions: { suggestion: JSON.stringify(result), generatedAt: new Date() } } }
      );
    }

    res.json({ success: true, data: result, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('AI suggestions error:', error);
    if (error.message.includes('GEMINI_API_KEY')) {
      return res.status(503).json({ error: 'AI service not configured. Please add GEMINI_API_KEY to your .env file.' });
    }
    res.status(500).json({ error: 'Failed to generate suggestions. Please try again.' });
  }
});

// POST /api/ai/leads
router.post('/leads', protect, async (req, res) => {
  try {
    const { campaignId, campaignName, channels } = req.body;

    const context = {
      companyName:    req.company.companyName,
      product:        req.company.product,
      targetAudience: req.company.targetAudience,
      campaignName,
      channels,
    };

    const result = await generateLeads(context);

    if (campaignId) {
      await Campaign.findOneAndUpdate(
        { _id: campaignId, company: req.company._id },
        { $push: { leads: { profile: JSON.stringify(result), generatedAt: new Date() } } }
      );
    }

    res.json({ success: true, data: result, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('AI leads error:', error);
    if (error.message.includes('GEMINI_API_KEY')) {
      return res.status(503).json({ error: 'AI service not configured. Please add GEMINI_API_KEY to your .env file.' });
    }
    res.status(500).json({ error: 'Failed to generate leads. Please try again.' });
  }
});

module.exports = router;