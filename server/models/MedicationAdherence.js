const mongoose = require('mongoose');
const { MED_STATUS } = require('../utils/constants');

const medicationAdherenceSchema = new mongoose.Schema({
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  takenAt: {
    type: Date
  },
  status: {
    type: String,
    enum: Object.values(MED_STATUS),
    default: MED_STATUS.PENDING
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MedicationAdherence', medicationAdherenceSchema);
