const express = require('express');
const { protect } = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const Company = require('../models/Company');

const router = express.Router();

// GET /api/campaigns — list all campaigns for logged-in company
router.get('/', protect, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ company: req.company._id }).sort({ createdAt: -1 });
    res.json({ campaigns });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns.' });
  }
});

// POST /api/campaigns — create a campaign
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, status, budget, channels, goals, startDate, endDate } = req.body;

    if (!name) return res.status(400).json({ error: 'Campaign name is required.' });

    const campaign = await Campaign.create({
      company: req.company._id,
      name,
      description,
      status: status || 'draft',
      budget: budget || 0,
      channels: channels || [],
      goals,
      startDate,
      endDate,
    });

    // Add campaign reference to company
    await Company.findByIdAndUpdate(req.company._id, {
      $push: { campaigns: campaign._id },
    });

    res.status(201).json({ message: 'Campaign created.', campaign });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    res.status(500).json({ error: 'Failed to create campaign.' });
  }
});

// GET /api/campaigns/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, company: req.company._id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
    res.json({ campaign });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign.' });
  }
});

// PATCH /api/campaigns/:id
router.patch('/:id', protect, async (req, res) => {
  try {
    const allowed = ['name', 'description', 'status', 'budget', 'channels', 'goals', 'startDate', 'endDate'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, company: req.company._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
    res.json({ message: 'Campaign updated.', campaign });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update campaign.' });
  }
});

// DELETE /api/campaigns/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, company: req.company._id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });

    await Company.findByIdAndUpdate(req.company._id, {
      $pull: { campaigns: campaign._id },
    });

    res.json({ message: 'Campaign deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete campaign.' });
  }
});

module.exports = router;