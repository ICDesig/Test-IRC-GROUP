import api from './api';

const userService = {
  // Obtenir tous les utilisateurs
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Obtenir un utilisateur par ID
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Générer les suggestions de login
  generateLoginSuggestions: async (firstName, lastName) => {
    const response = await api.get('/users/generate-login', {
      params: { first_name: firstName, last_name: lastName }
    });
    return response.data;
  },

  // Créer un utilisateur
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Mettre à jour un utilisateur
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Supprimer un utilisateur
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Obtenir les statistiques
  getStatistics: async () => {
    const response = await api.get('/users/statistics/overview');
    return response.data;
  },
};

export default userService;