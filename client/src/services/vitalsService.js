import api from './api';

export const vitalsService = {
  addVital: async (data) => {
    const res = await api.post('/vitals', data);
    return res.data;
  },
  getVitals: async (params = {}) => {
    const res = await api.get('/vitals', { params });
    return res.data;
  },
  getVitalsSummary: async (seniorId = null) => {
    const res = await api.get('/vitals/summary', { params: { seniorId } });
    return res.data;
  },
  deleteVital: async (id) => {
    const res = await api.delete(`/vitals/${id}`);
    return res.data;
  }
};

export default vitalsService;
