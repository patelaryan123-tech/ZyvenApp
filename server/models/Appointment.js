const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  doctorName: {
    type: String,
    required: true,
    trim: true
  },
  specialty: {
    type: String,
    default: 'General Physician'
  },
  clinicName: {
    type: String,
    trim: true
  },
  clinicLocation: {
    type: String,
    trim: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  }
}, {
  timestamps: true
});

appointmentSchema.index({ userId: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
