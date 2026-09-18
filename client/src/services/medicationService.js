import api from './api';

export const medicationService = {
  getMedications: async (params = {}) => {
    const response = await api.get('/medications', { params });
    return response.data;
  },
  getMedicationById: async (id) => {
    const response = await api.get(`/medications/${id}`);
    return response.data;
  },
  createMedication: async (data) => {
    const response = await api.post('/medications', data);
    return response.data;
  },
  updateMedication: async (id, data) => {
    const response = await api.put(`/medications/${id}`, data);
    return response.data;
  },
  deleteMedication: async (id) => {
    const response = await api.delete(`/medications/${id}`);
    return response.data;
  },
  takeMedication: async (id) => {
    const response = await api.post(`/medications/${id}/take`);
    return response.data;
  },
  skipMedication: async (id) => {
    const response = await api.post(`/medications/${id}/skip`);
    return response.data;
  },
  recordAdherence: async (id, data) => {
    const response = await api.post(`/medications/${id}/adherence`, data);
    return response.data;
  },
  getTodaySchedule: async () => {
    const response = await api.get('/medications/today');
    return response.data;
  },
  getAdherenceStats: async () => {
    const response = await api.get('/medications/adherence');
    return response.data;
  },
  getPrescriptions: async () => {
    const response = await api.get('/medications/prescriptions');
    return response.data;
  },
  createPrescription: async (data) => {
    const response = await api.post('/medications/prescriptions', data);
    return response.data;
  },
  deletePrescription: async (id) => {
    const response = await api.delete(`/medications/prescriptions/${id}`);
    return response.data;
  }
};

export default medicationService;
