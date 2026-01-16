import api from './api';

const authService = {
  // Connexion
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Réinitialiser le mot de passe (premier login)
  resetPassword: async (userId, passwordData) => {
    const response = await api.post(`/reset-password/${userId}`, passwordData);
    return response.data;
  },

  // Déconnexion
  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: async () => {
    const response = await api.get('/user');
    return response.data;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtenir le token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Obtenir l'utilisateur depuis le localStorage
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;