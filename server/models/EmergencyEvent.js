const mongoose = require('mongoose');
const { EVENT_TYPES } = require('../utils/constants');

const contactedPersonSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  relationship: { type: String },
  notifiedAt: { type: Date, default: Date.now },
  method: { type: String, default: 'Email/In-App' },
  status: { type: String, enum: ['Sent', 'Delivered', 'Failed'], default: 'Sent' }
}, { _id: false });

const emergencyEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  eventType: {
    type: String,
    enum: Object.values(EVENT_TYPES),
    default: 'SOS',
    required: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, default: 'Location coordinates captured' }
  },
  countdown: {
    type: Number,
    default: 5
  },
  status: {
    type: String,
    enum: ['Triggered', 'Active', 'Cancelled', 'Acknowledged', 'Resolved'],
    default: 'Active',
    index: true
  },
  contactedPeople: [contactedPersonSchema],
  triggeredAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

emergencyEventSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('EmergencyEvent', emergencyEventSchema);
