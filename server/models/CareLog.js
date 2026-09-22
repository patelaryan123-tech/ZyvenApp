const mongoose = require('mongoose');

const careLogSchema = new mongoose.Schema({
  seniorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Diet', 'Mood', 'Sleep', 'Mobility', 'Medication', 'General'],
    default: 'General'
  },
  note: {
    type: String,
    required: true,
    trim: true
  },
  sentiment: {
    type: String,
    enum: ['Positive', 'Neutral', 'Concern'],
    default: 'Neutral'
  }
}, {
  timestamps: true
});

careLogSchema.index({ seniorId: 1, createdAt: -1 });

module.exports = mongoose.model('CareLog', careLogSchema);
