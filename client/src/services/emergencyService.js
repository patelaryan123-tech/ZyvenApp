import api from './api';

export const emergencyService = {
  triggerSOS: async (data = {}) => {
    const response = await api.post('/emergency/sos', data);
    return response.data;
  },
  cancelSOS: async (id) => {
    const response = await api.post(`/emergency/${id}/cancel`);
    return response.data;
  },
  acknowledgeSOS: async (id) => {
    const response = await api.post(`/emergency/${id}/acknowledge`);
    return response.data;
  },
  resolveSOS: async (id) => {
    const response = await api.post(`/emergency/${id}/resolve`);
    return response.data;
  },
  getEmergencyHistory: async () => {
    const response = await api.get('/emergency/history');
    return response.data;
  },
  getActiveEmergency: async () => {
    const response = await api.get('/emergency/active');
    return response.data;
  },
  getContacts: async () => {
    const response = await api.get('/emergency/contacts');
    return response.data;
  },
  addContact: async (contactData) => {
    const response = await api.post('/emergency/contacts', contactData);
    return response.data;
  },
  deleteContact: async (id) => {
    const response = await api.delete(`/emergency/contacts/${id}`);
    return response.data;
  }
};

export default emergencyService;
