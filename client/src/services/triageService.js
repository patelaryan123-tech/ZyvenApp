import api from './api';

export const triageService = {
  evaluateSymptoms: async (data) => {
    const res = await api.post('/triage/evaluate', data);
    return res.data;
  }
};

export default triageService;
