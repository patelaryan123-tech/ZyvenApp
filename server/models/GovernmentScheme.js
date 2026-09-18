const mongoose = require('mongoose');

const governmentSchemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  department: {
    type: String,
    default: 'Ministry of Health and Family Welfare'
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Healthcare', 'Pension', 'Insurance', 'Housing', 'Senior Support', 'Disability', 'Other'],
    default: 'Healthcare',
    index: true
  },
  state: {
    type: String,
    default: 'All India',
    index: true
  },
  ageCriteria: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 120 }
  },
  incomeCriteria: {
    type: String,
    default: 'All Income Groups'
  },
  eligibility: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  requiredDocuments: [{
    type: String
  }],
  applicationUrl: {
    type: String,
    required: true
  },
  officialLink: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

governmentSchemeSchema.index({ category: 1, state: 1, isActive: 1 });
governmentSchemeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('GovernmentScheme', governmentSchemeSchema);
