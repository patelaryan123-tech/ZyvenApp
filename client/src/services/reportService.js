import api from './api';

export const reportService = {
  uploadReport: async (formData) => {
    const response = await api.post('/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  getReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },
  getReportById: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  }
};
