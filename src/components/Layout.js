import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnexion réussie');
      navigate('/login');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Tableau de bord', admin: false },
    { path: '/users', icon: '👥', label: 'Utilisateurs', admin: false },
    { path: '/activity-logs', icon: '📝', label: 'Logs d\'activité', admin: true },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-xl fixed h-screen overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-blue-500">
          <h2 className="text-2xl font-bold mb-4">LRC Group</h2>
          <div className="space-y-1">
            <p className="text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-blue-200">@{user?.login}</p>
            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-2 ${
              user?.role === 'admin' ? 'bg-blue-800 text-blue-100' :
              user?.role === 'manager' ? 'bg-purple-600 text-purple-100' :
              'bg-green-600 text-green-100'
            }`}>
              {user?.role === 'admin' ? 'Administrateur' : user?.role === 'manager' ? 'Manager' : 'Employé'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <ul className="py-4 space-y-1 px-3">
          {navItems.map((item) => {
            if (item.admin && !isAdmin()) return null;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-800 text-white font-semibold shadow-lg'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-500">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg bg-blue-800 hover:bg-blue-900 transition-all duration-200 text-white font-medium"
          >
            <span className="text-xl">🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;