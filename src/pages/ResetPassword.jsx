import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../services/authService';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(userId, formData);
      toast.success('Mot de passe défini avec succès ! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((err) => toast.error(err));
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de la définition du mot de passe');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { text: 'Au moins 8 caractères', regex: /.{8,}/, met: formData.password.length >= 8 },
    { text: 'Une lettre majuscule', regex: /[A-Z]/, met: /[A-Z]/.test(formData.password) },
    { text: 'Une lettre minuscule', regex: /[a-z]/, met: /[a-z]/.test(formData.password) },
    { text: 'Un chiffre', regex: /[0-9]/, met: /[0-9]/.test(formData.password) },
    { text: 'Un symbole (@, #, $, etc.)', regex: /[^A-Za-z0-9]/, met: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700 p-4">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white text-center">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold mb-2">LRC Group</h1>
            <h2 className="text-xl font-semibold mb-1">Définir votre mot de passe</h2>
            <p className="text-purple-100 text-sm">Première connexion - Créez votre mot de passe sécurisé</p>
          </div>

          {/* Requirements */}
          <div className="px-8 pt-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-5 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">✓</span>
                Le mot de passe doit contenir :
              </h3>
              <ul className="space-y-2">
                {passwordRequirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      req.met ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {req.met ? '✓' : '○'}
                    </span>
                    <span className={req.met ? 'text-green-700 font-medium' : 'text-gray-600'}>
                      {req.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !passwordRequirements.every(r => r.met)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enregistrement...
                </span>
              ) : (
                'Définir le mot de passe'
              )}
            </button>
          </form>
        </div>

        {/* Back to login */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-white hover:text-blue-100 text-sm font-medium transition-colors"
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;