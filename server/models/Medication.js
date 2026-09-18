const mongoose = require('mongoose');

const timeSchema = new mongoose.Schema({
  hour: { type: Number, required: true, min: 0, max: 23 },
  minute: { type: Number, required: true, min: 0, max: 59 },
  label: { type: String, enum: ['Morning', 'Afternoon', 'Evening', 'Night', 'Custom'], default: 'Morning' }
}, { _id: false });

const medicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  medicineName: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'AsNeeded'],
    default: 'Daily'
  },
  timeOfDay: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
    default: 'Morning'
  },
  times: [timeSchema],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  foodInstruction: {
    type: String,
    enum: ['Before Food', 'After Food', 'With Food', 'Empty Stomach', 'Anytime'],
    default: 'After Food'
  },
  instructions: {
    type: String
  },
  doctorName: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Paused', 'Completed'],
    default: 'Active'
  }
}, {
  timestamps: true
});

medicationSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Medication', medicationSchema);
