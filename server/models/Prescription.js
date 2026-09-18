const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
    required: true
  },
  doctorName: {
    type: String,
    default: 'General Physician'
  },
  prescribedDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  },
  extractedMedicines: [{
    medicineName: String,
    dosage: String,
    frequency: String
  }]
}, {
  timestamps: true
});

prescriptionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
