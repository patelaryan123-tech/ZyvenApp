import api from './api';

export const hospitalService = {
  getHospitals: async (params = {}) => {
    const response = await api.get('/hospitals', { params });
    return response.data;
  },
  searchNearby: async (lat, lng, params = {}) => {
    const response = await api.get('/hospitals/nearby', { 
      params: { lat, lng, ...params } 
    });
    return response.data;
  },
  getHospitalById: async (id) => {
    const response = await api.get(`/hospitals/${id}`);
    return response.data;
  }
};

export default hospitalService;
