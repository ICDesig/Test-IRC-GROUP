import React, { useState, useEffect } from 'react';
import activityLogService from '../services/activityLogService';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
  });

  useEffect(() => {
    loadLogs();
  }, [filters, pagination.current_page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...filters,
      };

      const response = await activityLogService.getAll(params);
      setLogs(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        per_page: response.data.per_page,
        total: response.data.total,
        last_page: response.data.last_page,
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPagination({ ...pagination, current_page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, current_page: newPage });
  };

  const getActionBadge = (action) => {
    const actions = {
      login: { label: '🔐 Connexion', class: 'bg-blue-100 text-blue-700' },
      logout: { label: '🚪 Déconnexion', class: 'bg-gray-100 text-gray-700' },
      create: { label: '➕ Création', class: 'bg-green-100 text-green-700' },
      update: { label: '✏️ Modification', class: 'bg-orange-100 text-orange-700' },
      delete: { label: '🗑️ Suppression', class: 'bg-red-100 text-red-700' },
      reset_password: { label: '🔑 Mot de passe défini', class: 'bg-purple-100 text-purple-700' },
    };

    const actionInfo = actions[action] || { label: action, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${actionInfo.class}`}>{actionInfo.label}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Logs d'activité</h1>
          <p className="text-gray-600">Historique complet des actions effectuées sur la plateforme</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <select
            name="action"
            value={filters.action}
            onChange={handleFilterChange}
            className="w-full md:w-64 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">📊 Toutes les actions</option>
            <option value="login">🔐 Connexion</option>
            <option value="logout">🚪 Déconnexion</option>
            <option value="create">➕ Création</option>
            <option value="update">✏️ Modification</option>
            <option value="delete">🗑️ Suppression</option>
            <option value="reset_password">🔑 Mot de passe défini</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Chargement des logs...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600 text-lg">Aucun log trouvé</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date et heure</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Utilisateur</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Adresse IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 font-medium">{formatDate(log.created_at)}</div>
                        </td>
                        <td className="px-6 py-4">
                          {log.user ? (
                            <div>
                              <div className="font-semibold text-gray-800">{log.user.first_name} {log.user.last_name}</div>
                              <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">@{log.user.login}</code>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-sm">Utilisateur supprimé</span>
                          )}
                        </td>
                        <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                        <td className="px-6 py-4 text-gray-700">{log.description}</td>
                        <td className="px-6 py-4">
                          <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono text-gray-700">{log.ip_address}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex items-center justify-center gap-6 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  ← Précédent
                </button>
                <span className="text-gray-700 font-medium">
                  Page {pagination.current_page} sur {pagination.last_page}
                  <span className="text-gray-500 ml-2">({pagination.total} logs)</span>
                </span>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ActivityLogs;