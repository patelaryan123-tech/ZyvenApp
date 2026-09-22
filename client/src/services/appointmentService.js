import api from './api';

export const appointmentService = {
  createAppointment: async (data) => {
    const res = await api.post('/appointments', data);
    return res.data;
  },
  getAppointments: async (seniorId = null) => {
    const res = await api.get('/appointments', { params: { seniorId } });
    return res.data;
  },
  updateAppointment: async (id, data) => {
    const res = await api.put(`/appointments/${id}`, data);
    return res.data;
  },
  deleteAppointment: async (id) => {
    const res = await api.delete(`/appointments/${id}`);
    return res.data;
  }
};

export default appointmentService;
