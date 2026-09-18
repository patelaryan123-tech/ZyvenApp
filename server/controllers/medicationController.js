const Medication = require('../models/Medication');
const MedicationAdherence = require('../models/MedicationAdherence');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Helper to get mongo user id
const getUserId = async (req) => {
  if (req.user && req.user._id) return req.user._id;
  if (req.user && req.user.id && req.user.id !== 'dev-user') return req.user.id;
  const fbUid = (req.user && req.user.firebaseUid) || (req.firebaseUser && req.firebaseUser.uid);
  if (fbUid) {
    const u = await User.findOne({ firebaseUid: fbUid });
    if (u) return u._id;
  }
  return req.user?.id || req.user?._id;
};

// 1. Create Medication
const createMedication = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { 
      medicineName, 
      dosage, 
      frequency = 'Daily', 
      timeOfDay = 'Morning', 
      times = [], 
      startDate = new Date(), 
      endDate, 
      foodInstruction = 'After Food', 
      instructions, 
      doctorName 
    } = req.body;

    const medication = await Medication.create({
      userId,
      medicineName,
      dosage,
      frequency,
      timeOfDay,
      times,
      startDate,
      endDate,
      foodInstruction,
      instructions,
      doctorName,
      status: 'Active'
    });

    return successResponse(res, 'Medication created successfully', medication, 201);
  } catch (error) {
    console.error('createMedication error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 2. Get All Medications for User
const getMedications = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { status, timeOfDay, search } = req.query;

    const query = { userId };
    if (status) query.status = status;
    if (timeOfDay) query.timeOfDay = timeOfDay;
    if (search) {
      query.medicineName = { $regex: search, $options: 'i' };
    }

    const medications = await Medication.find(query).sort({ createdAt: -1 });
    return successResponse(res, 'Medications retrieved', medications);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 3. Get Medication by ID
const getMedicationById = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const medication = await Medication.findOne({ _id: req.params.id, userId });
    if (!medication) return errorResponse(res, 'Medication not found', 404);
    return successResponse(res, 'Medication retrieved', medication);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 4. Update Medication
const updateMedication = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!medication) return errorResponse(res, 'Medication not found', 404);
    return successResponse(res, 'Medication updated successfully', medication);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 5. Delete Medication
const deleteMedication = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const medication = await Medication.findOneAndDelete({ _id: req.params.id, userId });
    if (!medication) return errorResponse(res, 'Medication not found', 404);
    await MedicationAdherence.deleteMany({ medicationId: req.params.id });
    return successResponse(res, 'Medication deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 6. Record Adherence / Mark as Taken
const recordAdherence = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { status = 'Taken', notes = '', scheduledTime = new Date() } = req.body;

    const adherence = await MedicationAdherence.create({
      medicationId: req.params.id,
      userId,
      scheduledTime,
      takenAt: status === 'Taken' ? new Date() : null,
      status,
      notes
    });

    return successResponse(res, `Medication marked as ${status}`, adherence, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 7. Take Medication Shortcut
const takeMedication = async (req, res) => {
  req.body = { status: 'Taken', scheduledTime: new Date() };
  return recordAdherence(req, res);
};

// 8. Skip Medication Shortcut
const skipMedication = async (req, res) => {
  req.body = { status: 'Skipped', scheduledTime: new Date() };
  return recordAdherence(req, res);
};

// 9. Get Adherence Stats & Today Schedule
const getTodaySchedule = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const medications = await Medication.find({
      userId,
      status: 'Active'
    });

    // Fetch today's adherence records
    const todayAdherence = await MedicationAdherence.find({
      userId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Map adherence to medications
    const enrichedMeds = medications.map(med => {
      const adh = todayAdherence.find(a => a.medicationId.toString() === med._id.toString());
      return {
        ...med.toObject(),
        todayStatus: adh ? adh.status : 'Pending',
        takenAt: adh ? adh.takenAt : null
      };
    });

    return successResponse(res, 'Today schedule retrieved', enrichedMeds);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 10. Overall Adherence Stats
const getOverallAdherence = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const adherenceRecords = await MedicationAdherence.find({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: 1 });

    const total = adherenceRecords.length;
    const taken = adherenceRecords.filter(r => r.status === 'Taken').length;
    const missed = adherenceRecords.filter(r => r.status === 'Missed').length;
    const skipped = adherenceRecords.filter(r => r.status === 'Skipped').length;
    const rate = total > 0 ? Math.round((taken / total) * 100) : 100;

    return successResponse(res, 'Adherence stats calculated', {
      rate,
      total,
      taken,
      missed,
      skipped,
      records: adherenceRecords
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 11. Prescriptions
const getPrescriptions = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const prescriptions = await Prescription.find({ userId }).sort({ createdAt: -1 });
    return successResponse(res, 'Prescriptions retrieved', prescriptions);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const createPrescription = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { fileName, fileUrl, fileType, doctorName, notes, extractedMedicines } = req.body;
    const prescription = await Prescription.create({
      userId,
      fileName: fileName || 'Prescription Document',
      fileUrl: fileUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
      fileType: fileType || 'image/jpeg',
      doctorName: doctorName || 'Dr. Specialist',
      notes,
      extractedMedicines: extractedMedicines || []
    });
    return successResponse(res, 'Prescription uploaded successfully', prescription, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const deletePrescription = async (req, res) => {
  try {
    const userId = await getUserId(req);
    await Prescription.findOneAndDelete({ _id: req.params.id, userId });
    return successResponse(res, 'Prescription deleted');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createMedication,
  getMedications,
  getMedicationById,
  updateMedication,
  deleteMedication,
  recordAdherence,
  takeMedication,
  skipMedication,
  getTodaySchedule,
  getOverallAdherence,
  getPrescriptions,
  createPrescription,
  deletePrescription
};
