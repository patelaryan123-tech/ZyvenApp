const EmergencyEvent = require('../models/EmergencyEvent');
const User = require('../models/User');
const emailService = require('./emailService');
const socketService = require('./socketService');

const findUser = async (userId) => {
  let user = null;
  if (userId && userId.toString().length === 24) {
    user = await User.findById(userId);
  }
  if (!user && userId) {
    user = await User.findOne({ firebaseUid: userId });
  }
  return user;
};

const createEmergency = async (userId, eventType = 'SOS', location = {}) => {
  const user = await findUser(userId);
  const userMongoId = user ? user._id : userId;
  const userName = user ? user.name : 'Senior Citizen';

  const defaultLocation = {
    latitude: location.latitude || 22.5726,
    longitude: location.longitude || 88.3639,
    address: location.address || 'GPS Coordinates captured'
  };

  const contactsToNotify = (user?.emergencyContacts || []).map(c => ({
    name: c.name,
    phone: c.phone,
    email: c.email,
    relationship: c.relationship,
    method: 'Email & In-App Broadcast',
    notifiedAt: new Date(),
    status: 'Sent'
  }));

  const event = await EmergencyEvent.create({
    userId: userMongoId,
    eventType: eventType || 'SOS',
    location: defaultLocation,
    status: 'Active',
    triggeredAt: new Date(),
    contactedPeople: contactsToNotify
  });

  // Notify via Realtime Socket
  try {
    socketService.emitEmergency(userMongoId, event);
  } catch (err) {
    console.warn('Socket emergency broadcast error:', err.message);
  }

  // Send Email Alerts to emergency contacts
  if (user && user.emergencyContacts && user.emergencyContacts.length > 0) {
    const validContacts = user.emergencyContacts.filter(c => c.email);
    if (validContacts.length > 0) {
      emailService.sendEmergencyAlert(event, validContacts, user).catch(err => console.error('Emergency email error:', err.message));
    }
  }

  return event;
};

const cancelEmergency = async (eventId, userId) => {
  const user = await findUser(userId);
  const userMongoId = user ? user._id : userId;
  
  const event = await EmergencyEvent.findOne({ 
    _id: eventId, 
    userId: userMongoId 
  });
  
  if (!event) throw new Error('Emergency event not found');
  
  event.status = 'Cancelled';
  event.cancelledAt = new Date();
  await event.save();
  return event;
};

const acknowledgeEmergency = async (eventId) => {
  const event = await EmergencyEvent.findById(eventId);
  if (!event) throw new Error('Emergency event not found');
  event.status = 'Acknowledged';
  await event.save();
  return event;
};

const resolveEmergency = async (eventId) => {
  const event = await EmergencyEvent.findById(eventId);
  if (!event) throw new Error('Emergency event not found');
  event.status = 'Resolved';
  event.resolvedAt = new Date();
  await event.save();
  return event;
};

const getEmergencyHistory = async (userId) => {
  const user = await findUser(userId);
  const userMongoId = user ? user._id : userId;
  return await EmergencyEvent.find({ userId: userMongoId }).sort({ createdAt: -1 });
};

module.exports = {
  createEmergency,
  cancelEmergency,
  acknowledgeEmergency,
  resolveEmergency,
  getEmergencyHistory
};
