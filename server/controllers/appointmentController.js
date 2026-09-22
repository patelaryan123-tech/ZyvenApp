const Appointment = require('../models/Appointment');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// 1. CREATE APPOINTMENT
const createAppointment = async (req, res) => {
  try {
    const { doctorName, specialty, clinicName, clinicLocation, appointmentDate, appointmentTime, reason, notes, targetUserId } = req.body;
    const userId = targetUserId || req.user._id;

    if (!doctorName || !appointmentDate || !appointmentTime) {
      return errorResponse(res, 'Doctor name, date, and time are required', 400);
    }

    const appointment = await Appointment.create({
      userId,
      doctorName: doctorName.trim(),
      specialty: specialty || 'General Physician',
      clinicName: clinicName ? clinicName.trim() : '',
      clinicLocation: clinicLocation ? clinicLocation.trim() : '',
      appointmentDate: new Date(appointmentDate),
      appointmentTime: appointmentTime.trim(),
      reason: reason ? reason.trim() : '',
      notes: notes ? notes.trim() : '',
      status: 'Upcoming'
    });

    return successResponse(res, 'Appointment scheduled successfully', appointment, 201);
  } catch (error) {
    console.error('createAppointment error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 2. GET APPOINTMENTS FOR USER
const getAppointments = async (req, res) => {
  try {
    const userId = req.query.seniorId || req.user._id;
    const { status } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    return successResponse(res, 'Appointments retrieved', appointments);
  } catch (error) {
    console.error('getAppointments error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 3. UPDATE APPOINTMENT
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Appointment.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    return successResponse(res, 'Appointment updated', updated);
  } catch (error) {
    console.error('updateAppointment error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 4. DELETE APPOINTMENT
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await Appointment.findOneAndDelete({ _id: id, userId: req.user._id });
    return successResponse(res, 'Appointment deleted');
  } catch (error) {
    console.error('deleteAppointment error:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment
};
