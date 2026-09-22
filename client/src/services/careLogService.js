import api from './api';

export const careLogService = {
  addCareLog: async (data) => {
    const res = await api.post('/care-logs', data);
    return res.data;
  },
  getCareLogs: async (seniorId = null) => {
    const res = await api.get('/care-logs', { params: { seniorId } });
    return res.data;
  },
  deleteCareLog: async (id) => {
    const res = await api.delete(`/care-logs/${id}`);
    return res.data;
  }
};

export default careLogService;
