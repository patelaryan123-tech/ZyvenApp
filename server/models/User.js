const mongoose = require('mongoose');
const { ROLES } = require('../utils/constants');

const linkedUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationship: {
    type: String,
    required: true
  },
  permissions: [{
    type: String
  }]
}, { _id: false });

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  relationship: { type: String, required: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    sparse: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    select: false
  },
  phone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.SENIOR
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: { type: String },
    expiresAt: { type: Date }
  },
  language: {
    type: String,
    default: 'en'
  },
  profileImage: {
    type: String,
    default: ''
  },
  // Government Scheme & Healthcare Demographic Criteria
  age: {
    type: Number,
    default: 60
  },
  state: {
    type: String,
    default: 'All India'
  },
  incomeCategory: {
    type: String,
    default: 'Low Income (< Rs. 2.5 Lakh/yr)'
  },
  hasDisability: {
    type: Boolean,
    default: false
  },
  gender: {
    type: String,
    default: 'All'
  },
  emergencyContacts: [emergencyContactSchema],
  linkedUsers: [linkedUserSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
