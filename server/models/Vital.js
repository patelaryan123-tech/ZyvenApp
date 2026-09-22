const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['BP', 'BloodSugar', 'HeartRate', 'SpO2', 'Weight'],
    required: true
  },
  systolic: {
    type: Number // For BP (mmHg)
  },
  diastolic: {
    type: Number // For BP (mmHg)
  },
  value: {
    type: Number // For BloodSugar, HeartRate, SpO2, Weight
  },
  unit: {
    type: String,
    required: true
  },
  context: {
    type: String,
    enum: ['Fasting', 'PostMeal', 'Bedtime', 'Routine', 'Random'],
    default: 'Routine'
  },
  notes: {
    type: String,
    trim: true
  },
  isAbnormal: {
    type: Boolean,
    default: false
  },
  measuredAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

vitalSchema.index({ userId: 1, type: 1, measuredAt: -1 });

module.exports = mongoose.model('Vital', vitalSchema);
