import api from './api';

export const patientService = {
  // Get all linked patients for current caregiver
  getLinkedPatients: async () => {
    const res = await api.get('/users/link/all');
    return res.data;
  },

  // Link a patient by email, phone, or userId
  linkPatient: async (data) => {
    const res = await api.post('/users/link', data);
    return res.data;
  },

  // Unlink a patient
  unlinkPatient: async (targetUserId) => {
    const res = await api.delete(`/users/link/${targetUserId}`);
    return res.data;
  },

  // Get available registered patients to link
  getAvailablePatients: async () => {
    const res = await api.get('/users/patients/available');
    return res.data;
  }
};

export default patientService;
