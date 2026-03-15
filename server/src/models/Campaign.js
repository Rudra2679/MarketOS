const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: [150, 'Campaign name cannot exceed 150 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft',
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative'],
    default: 0,
  },
  channels: [{
    type: String,
    enum: ['social_media', 'email', 'seo', 'ppc', 'content', 'influencer', 'other'],
  }],
  goals: {
    type: String,
    trim: true,
    maxlength: [500, 'Goals cannot exceed 500 characters'],
  },
  startDate: { type: Date },
  endDate: { type: Date },
  aiSuggestions: [{
    suggestion: String,
    generatedAt: { type: Date, default: Date.now },
  }],
  leads: [{
    profile: String,
    strategy: String,
    generatedAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Campaign', campaignSchema);