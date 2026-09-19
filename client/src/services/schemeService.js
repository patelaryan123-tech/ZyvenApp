import api from './api';

export const schemeService = {
  getSchemes: async (params = {}) => {
    const response = await api.get('/schemes', { params });
    return response.data;
  },
  getPersonalizedSchemes: async (params = {}) => {
    const response = await api.get('/schemes/personalized', { params });
    return response.data;
  },
  checkEligibility: async (criteria = {}) => {
    const response = await api.post('/schemes/check-eligibility', criteria);
    return response.data;
  },
  getEligibleSchemes: async (criteria = {}) => {
    const response = await api.post('/schemes/check-eligibility', criteria);
    return response.data;
  },
  getSchemeById: async (id) => {
    const response = await api.get(`/schemes/${id}`);
    return response.data;
  },
  updateProfileCriteria: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  }
};

export default schemeService;
