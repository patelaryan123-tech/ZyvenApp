const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['Hospital', 'Clinic', 'Diagnostic Center'],
    default: 'Hospital',
    index: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
    index: true
  },
  state: {
    type: String,
    default: 'Gujarat',
    index: true
  },
  pincode: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  website: {
    type: String
  },
  emergencyAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  specialties: [{
    type: String
  }],
  services: [{
    type: String
  }],
  openingHours: {
    type: String,
    default: '24/7'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.5
  }
}, {
  timestamps: true
});

hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ name: 'text', address: 'text', specialties: 'text' });

module.exports = mongoose.model('Hospital', hospitalSchema);
