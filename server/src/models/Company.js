const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
  },
  product: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [500, 'Product description cannot exceed 500 characters'],
  },
  targetAudience: {
    type: String,
    required: [true, 'Target audience is required'],
    trim: true,
    maxlength: [500, 'Target audience cannot exceed 500 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  campaigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
  }],
}, {
  timestamps: true,
});

// Hash password before saving
companySchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
companySchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
companySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Company', companySchema);