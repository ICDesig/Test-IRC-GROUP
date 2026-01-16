import api from './api';

const activityLogService = {
  // Obtenir tous les logs
  getAll: async (params = {}) => {
    const response = await api.get('/activity-logs', { params });
    return response.data;
  },

  // Obtenir un log par ID
  getById: async (id) => {
    const response = await api.get(`/activity-logs/${id}`);
    return response.data;
  },

  // Obtenir les statistiques
  getStatistics: async () => {
    const response = await api.get('/activity-logs/statistics/overview');
    return response.data;
  },
};

export default activityLogService;