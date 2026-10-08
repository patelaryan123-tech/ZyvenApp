const User = require('../models/User');
const Medication = require('../models/Medication');
const MedicationAdherence = require('../models/MedicationAdherence');
const EmergencyEvent = require('../models/EmergencyEvent');
const CareLog = require('../models/CareLog');
const Vitals = require('../models/Vitals');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return successResponse(res, 'Users retrieved', users);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getAvailablePatients = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const linkedIds = (currentUser.linkedUsers || []).map(u => u.userId ? u.userId.toString() : null).filter(Boolean);
    linkedIds.push(req.user.id.toString());

    // Find registered Senior or Patient users not yet linked
    const available = await User.find({
      _id: { $nin: linkedIds }
    }).select('name email phone role age gender profileImage').limit(20);

    return successResponse(res, 'Available patients retrieved', available);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, 'User retrieved', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, 'User updated', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const linkUser = async (req, res) => {
  try {
    const { email, phone, userId, relationship, permissions } = req.body;
    
    let linkedUser = null;
    if (userId) {
      linkedUser = await User.findById(userId);
    } else if (email) {
      linkedUser = await User.findOne({ email: email.trim().toLowerCase() });
    } else if (phone) {
      linkedUser = await User.findOne({ phone: phone.trim() });
    } else {
      return errorResponse(res, 'Please provide an email, phone, or select a patient', 400);
    }

    if (!linkedUser) return errorResponse(res, 'Patient user not found in system', 404);

    const currentUser = await User.findById(req.user.id);
    if (currentUser._id.toString() === linkedUser._id.toString()) {
      return errorResponse(res, 'You cannot link yourself as a patient', 400);
    }
    
    const alreadyLinked = currentUser.linkedUsers.find(
      u => u.userId && u.userId.toString() === linkedUser._id.toString()
    );
    if (alreadyLinked) return errorResponse(res, 'Patient is already linked', 400);

    currentUser.linkedUsers.push({
      userId: linkedUser._id,
      relationship: relationship || 'Patient',
      permissions: permissions || ['read_vitals', 'read_medications', 'receive_alerts']
    });

    await currentUser.save();
    return successResponse(res, 'Patient linked successfully', currentUser.linkedUsers);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const unlinkUser = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const currentUser = await User.findById(req.user.id);
    
    currentUser.linkedUsers = currentUser.linkedUsers.filter(
      u => u.userId && u.userId.toString() !== targetUserId
    );

    await currentUser.save();
    return successResponse(res, 'Patient unlinked successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getLinkedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).populate('linkedUsers.userId', 'name email role phone age gender profileImage');
    if (!currentUser) return errorResponse(res, 'User not found', 404);

    const result = await Promise.all(
      (currentUser.linkedUsers || []).map(async (item) => {
        const patient = item.userId;
        if (!patient) return null;

        const patientId = patient._id;

        // Active medications & today's adherence
        const activeMeds = await Medication.find({ userId: patientId, status: 'Active' });

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todayAdherences = await MedicationAdherence.find({
          userId: patientId,
          createdAt: { $gte: startOfToday }
        }).populate('medicationId', 'medicineName dosage');

        const takenCount = todayAdherences.filter(a => a.status === 'Taken').length;
        const missedCount = todayAdherences.filter(a => a.status === 'Missed').length;
        const totalMeds = Math.max(activeMeds.length, todayAdherences.length, 1);

        const adherencePercent = Math.round((takenCount / Math.max(takenCount + missedCount, totalMeds)) * 100);

        // Emergency events
        const sosEvents = await EmergencyEvent.find({ userId: patientId, status: { $in: ['Triggered', 'Active'] } });

        // Last Vitals
        let lastVitalsObj = { bp: '120/80', sugar: '100 mg/dL', recorded: 'Today' };
        if (Vitals) {
          const latestVital = await Vitals.findOne({ seniorId: patientId }).sort({ createdAt: -1 });
          if (latestVital) {
            lastVitalsObj = {
              bp: latestVital.systolic ? `${latestVital.systolic}/${latestVital.diastolic}` : '120/80',
              sugar: latestVital.bloodSugar ? `${latestVital.bloodSugar} mg/dL` : '100 mg/dL',
              recorded: new Date(latestVital.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
        }

        // Care Notes
        let careNotesList = [];
        if (CareLog) {
          const logs = await CareLog.find({ seniorId: patientId }).sort({ createdAt: -1 }).limit(10);
          careNotesList = logs.map(l => ({
            _id: l._id,
            author: l.authorName || 'Caregiver',
            note: l.note,
            time: new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
        }

        // Activity timeline
        const activityLog = [];
        todayAdherences.forEach(a => {
          activityLog.push({
            type: a.status === 'Taken' ? 'taken' : 'missed',
            icon: a.status === 'Taken' ? 'check' : 'x',
            label: a.status === 'Taken' ? 'Medication Taken' : 'Missed Dose',
            desc: a.medicationId?.medicineName ? `${a.medicationId.medicineName} (${a.medicationId.dosage || ''})` : 'Scheduled Dose',
            time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: a.status === 'Taken' ? 'green' : 'red'
          });
        });

        sosEvents.forEach(e => {
          activityLog.push({
            type: 'sos',
            icon: 'alert',
            label: `SOS Alert (${e.eventType})`,
            desc: e.location?.address || 'Emergency SOS triggered',
            time: new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: 'red'
          });
        });

        if (activityLog.length === 0) {
          activityLog.push({
            type: 'taken',
            icon: 'check',
            label: 'Patient Active',
            desc: 'Monitoring active & health normal',
            time: 'Today',
            color: 'green'
          });
        }

        // Weekly trend
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weeklyData = days.map((day) => ({
          day,
          val: Math.min(100, Math.max(50, adherencePercent))
        }));

        // Status
        let status = 'Good';
        if (sosEvents.length > 0 || missedCount >= 2) {
          status = 'Critical';
        } else if (missedCount === 1) {
          status = 'Warning';
        }

        return {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone || 'N/A',
          relation: item.relationship || 'Patient',
          age: patient.age || 65,
          gender: patient.gender || 'Not specified',
          status,
          adherence: adherencePercent,
          lastVitals: lastVitalsObj,
          medications: {
            taken: takenCount,
            missed: missedCount,
            total: totalMeds
          },
          sosEvents: sosEvents.length,
          weeklyData,
          activityLog,
          careNotes: careNotesList
        };
      })
    );

    const validPatients = result.filter(Boolean);
    return successResponse(res, 'Linked users retrieved successfully', validPatients);
  } catch (error) {
    console.error('getLinkedUsers error:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllUsers,
  getAvailablePatients,
  getUserById,
  updateUser,
  linkUser,
  unlinkUser,
  getLinkedUsers
};
