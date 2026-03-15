const express = require('express');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { companyName, product, targetAudience, email, password } = req.body;

    // Validate required fields
    if (!companyName || !product || !targetAudience || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if company already exists
    const existing = await Company.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Create company
    const company = await Company.create({
      companyName,
      product,
      targetAudience,
      email,
      password,
    });

    const token = signToken(company._id);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      company,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const company = await Company.findOne({ email }).select('+password');
    if (!company) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await company.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(company._id);

    res.json({
      message: 'Login successful.',
      token,
      company,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ company: req.company });
});

// PATCH /api/auth/profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const { companyName, product, targetAudience } = req.body;
    const updates = {};
    if (companyName) updates.companyName = companyName;
    if (product) updates.product = product;
    if (targetAudience) updates.targetAudience = targetAudience;

    const updated = await Company.findByIdAndUpdate(
      req.company._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated.', company: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;