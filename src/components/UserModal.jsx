import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import { toast } from 'react-toastify';

const UserModal = ({ user, onClose }) => {
  const { isAdmin } = useAuth();
  const isEdit = !!user;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    role: 'employee',
    is_active: false,
    address: '',
    hire_date: '',
    selected_login: '',
  });
  
  const [loginSuggestions, setLoginSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        position: user.position || '',
        department: user.department || '',
        role: user.role || 'employee',
        is_active: user.is_active || false,
        address: user.address || '',
        hire_date: user.hire_date || '',
        selected_login: user.login || '',
      });
    }
  }, [user]);

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  const val = type === 'checkbox' ? checked : value;
  
  // 1. On met à jour l'état immédiatement
  setFormData(prev => {
    const newData = { ...prev, [name]: val };
    
    // 2. On déclenche les suggestions avec les nouvelles valeurs DIRECTEMENT
    if (!isEdit && (name === 'first_name' || name === 'last_name')) {
      if (newData.first_name.length > 1 && newData.last_name.length > 1) {
        generateLoginSuggestions(newData.first_name, newData.last_name);
      }
    }
    return newData;
  });
};

  const generateLoginSuggestions = async (firstName, lastName) => {
    if (!firstName || !lastName) return;

    try {
      setLoadingSuggestions(true);
      const response = await userService.generateLoginSuggestions(firstName, lastName);
      if (response.success) {
        setLoginSuggestions(response.data.suggestions);
        const firstAvailable = response.data.suggestions.find(s => s.available);
        if (firstAvailable) {
          setFormData(prev => ({ ...prev, selected_login: firstAvailable.login }));
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isEdit && !formData.selected_login) {
    toast.error('Vous devez sélectionner un login');
    return;
  }

  setLoading(true);

  try {
    // On prépare les données pour le backend
    const dataToSend = { 
      ...formData,
      login: formData.selected_login // On injecte 'login' que Laravel attend
    };
    
    // Supprimer selected_login pour ne pas envoyer de doublon inutile
    delete dataToSend.selected_login;

    if (isEdit) {
      await userService.update(user.id, dataToSend);
      toast.success('Utilisateur modifié avec succès');
    } else {
      await userService.create(dataToSend);
      toast.success('Utilisateur créé avec succès');
    }

    onClose(true);
 } catch (error) {
  console.error('Erreur détaillée:', error.response?.data);
  const errors = error.response?.data?.errors;
  if (errors) {
    // Affiche chaque erreur de validation Laravel dans un toast
    Object.values(errors).flat().forEach((err) => toast.error(err));
  } else {
    toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
  }
} finally {
  setLoading(false);
}
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
         onClick={() => onClose()}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
           onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h2>
          <button
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Prénom et Nom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={isEdit}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={isEdit}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              />
            </div>
          </div>
          {/* Affichage du login en mode édition */}
            {isEdit && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <label className="block text-sm font-semibold text-blue-800 mb-1">
                  Identifiant système (Login)
                </label>
                <div className="text-lg font-mono font-bold text-blue-600">
                  @{formData.selected_login}
                </div>
              </div>
            )}

          {/* Suggestions de login */}
          {!isEdit && loginSuggestions.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sélectionner un login * (5 suggestions)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {loginSuggestions.map((suggestion, index) => (
                  <label
                    key={index}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.selected_login === suggestion.login
                        ? 'border-blue-500 bg-blue-50'
                        : suggestion.available
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selected_login"
                      value={suggestion.login}
                      checked={formData.selected_login === suggestion.login}
                      onChange={handleChange}
                      disabled={!suggestion.available}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-mono font-medium text-gray-700">
                      @{suggestion.login}
                      {!suggestion.available && (
                        <span className="text-red-500 ml-2 text-xs">(déjà pris)</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {loadingSuggestions && (
            <div className="text-center py-4 text-gray-600">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="mt-2">Génération des suggestions...</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email (optionnel)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Téléphone et Poste */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Poste
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Département */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Département
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Rôle et Statut (Admin uniquement) */}
          {isAdmin() && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="employee">Employé</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-gray-700">Compte actif</span>
                    <span className="block text-xs text-gray-500">Activé après le 1er mot de passe</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Date d'embauche */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date d'embauche
            </label>
            <input
              type="date"
              name="hire_date"
              value={formData.hire_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            ></textarea>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onClose()}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || loadingSuggestions}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;