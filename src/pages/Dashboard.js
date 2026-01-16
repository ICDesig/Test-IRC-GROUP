import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import activityLogService from '../services/activityLogService';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [logStatistics, setLogStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);

      if (user.role === 'admin') {
        const userStats = await userService.getStatistics();
        setStatistics(userStats.data);

        const logStats = await activityLogService.getStatistics();
        setLogStatistics(logStats.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color = 'blue' }) => (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-${color}-500 hover:-translate-y-1`}>
      <div className="flex items-center gap-4">
        <div className={`text-5xl bg-gradient-to-br from-${color}-500 to-${color}-600 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tableau de bord</h1>
          <p className="text-gray-600 text-lg">
            Bienvenue, <span className="font-semibold text-blue-600">{user.first_name} {user.last_name}</span>
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="text-3xl">👤</span>
            Mes informations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 font-semibold mb-1">Login</p>
              <p className="text-lg font-mono text-gray-800">@{user.login}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 font-semibold mb-1">Email</p>
              <p className="text-lg text-gray-800">{user.email || 'Non renseigné'}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 font-semibold mb-1">Téléphone</p>
              <p className="text-lg text-gray-800">{user.phone || 'Non renseigné'}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 font-semibold mb-1">Poste</p>
              <p className="text-lg text-gray-800">{user.position || 'Non renseigné'}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 font-semibold mb-1">Département</p>
              <p className="text-lg text-gray-800">{user.department || 'Non renseigné'}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 font-semibold mb-1">Rôle</p>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
                user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                user.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                'bg-green-100 text-green-700'
              }`}>
                {user.role === 'admin' ? '👑 Administrateur' : user.role === 'manager' ? '📊 Manager' : '👤 Employé'}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Statistics */}
        {user.role === 'admin' && !loading && statistics && (
          <>
            {/* User Statistics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-3xl">📊</span>
                Statistiques des utilisateurs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon="👥" title="Total utilisateurs" value={statistics.total_users} color="blue" />
                <StatCard icon="✅" title="Utilisateurs actifs" value={statistics.active_users} color="green" />
                <StatCard icon="⛔" title="Utilisateurs inactifs" value={statistics.inactive_users} color="gray" />
                <StatCard icon="🔐" title="En attente de mot de passe" value={statistics.first_login_pending} color="orange" />
              </div>
            </div>

            {/* Role Distribution */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                Répartition par rôle
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon="👑" title="Administrateurs" value={statistics.admins} color="blue" />
                <StatCard icon="📊" title="Managers" value={statistics.managers} color="purple" />
                <StatCard icon="👤" title="Employés" value={statistics.employees} color="green" />
              </div>
            </div>

            {/* Log Statistics */}
            {logStatistics && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="text-3xl">📝</span>
                  Statistiques des logs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard icon="📝" title="Total des logs" value={logStatistics.total_logs} color="indigo" />
                  <StatCard icon="🔐" title="Connexions" value={logStatistics.logins} color="blue" />
                  <StatCard icon="📅" title="Logs aujourd'hui" value={logStatistics.today_logs} color="green" />
                  <StatCard icon="🔑" title="Mots de passe définis" value={logStatistics.password_resets} color="purple" />
                </div>
              </div>
            )}
          </>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Chargement des statistiques...</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;